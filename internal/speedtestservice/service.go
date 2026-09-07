package speedtestservice

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/showwin/speedtest-go/speedtest"
	"github.com/uploadpulse/uploadpulse/internal/settings"
)

// EventCallback defines listener callbacks dispatched to frontend or caller.
type EventCallback struct {
	OnStateChange func(StateInfo)
	OnMetrics     func(LiveMetrics)
}

// Service manages speedtest lifecycle, server discovery, and pure upload testing.
type Service struct {
	mu              sync.RWMutex
	state           State
	activeSessionID string
	cancelFunc      context.CancelFunc
	workerWG        sync.WaitGroup

	cachedServers   speedtest.Servers
	lastServersFetch time.Time
	customServer    *speedtest.Server

	callbacks       EventCallback
	lastMetricTime  time.Time
}

// NewService creates a new speedtest Service.
func NewService(cb EventCallback) *Service {
	return &Service{
		state:     StateIdle,
		callbacks: cb,
	}
}

// GetState returns the current state and session ID.
func (s *Service) GetState() StateInfo {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return StateInfo{
		State:     s.state,
		SessionID: s.activeSessionID,
	}
}

// SetCallbacks updates event listener callbacks.
func (s *Service) SetCallbacks(cb EventCallback) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.callbacks = cb
}

// CancelTest requests immediate, technically honest hard cancellation of the active test.
func (s *Service) CancelTest() error {
	s.mu.Lock()
	if s.state == StateIdle || s.state == StateCompleted || s.state == StateCancelled || s.state == StateFailed {
		s.mu.Unlock()
		return nil
	}

	sessionID := s.activeSessionID
	cancel := s.cancelFunc
	s.mu.Unlock()

	if cancel != nil {
		cancel()
	}

	// Wait for all workers from the previous test to actually stop before marking idle
	done := make(chan struct{})
	go func() {
		s.workerWG.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(5 * time.Second):
		// Grace timeout safety
	}

	s.transition(StateCancelled, sessionID, "Upload test cancelled by user", 0, "")
	return nil
}

// DiscoverServers retrieves available speedtest servers with bounded retry and exponential backoff.
func (s *Service) DiscoverServers(cfg settings.NetworkSettings) ([]ServerInfo, error) {
	s.mu.Lock()
	// Return cached servers if fetched within 5 minutes and not custom keyword
	if len(s.cachedServers) > 0 && time.Since(s.lastServersFetch) < 5*time.Minute && cfg.ServerSearchKeyword == "" {
		res := s.mapServersToInfo(s.cachedServers)
		s.mu.Unlock()
		return res, nil
	}
	s.mu.Unlock()

	var servers speedtest.Servers
	var lastErr error
	maxRetries := 3

	for attempt := 1; attempt <= maxRetries; attempt++ {
		client := s.createSpeedtestClient(cfg)

		var err error
		servers, err = client.FetchServerListContext(context.Background())
		if err == nil && cfg.ServerSearchKeyword != "" {
			kw := strings.ToLower(cfg.ServerSearchKeyword)
			var matched speedtest.Servers
			for _, s := range servers {
				if strings.Contains(strings.ToLower(s.ID), kw) ||
					strings.Contains(strings.ToLower(s.Name), kw) ||
					strings.Contains(strings.ToLower(s.Sponsor), kw) ||
					strings.Contains(strings.ToLower(s.Country), kw) {
					matched = append(matched, s)
				}
			}
			servers = matched
		}

		if err == nil && len(servers) > 0 {
			lastErr = nil
			break
		}
		lastErr = err
		time.Sleep(time.Duration(attempt*500) * time.Millisecond)
	}

	if lastErr != nil && len(servers) == 0 {
		return nil, s.mapNetworkError(lastErr)
	}

	s.mu.Lock()
	s.cachedServers = servers
	s.lastServersFetch = time.Now()
	res := s.mapServersToInfo(servers)
	s.mu.Unlock()

	return res, nil
}

// PingServer measures latency to a specific server ID for server selection without download data.
func (s *Service) PingServer(serverID string, cfg settings.NetworkSettings) (int64, error) {
	s.mu.RLock()
	cached := s.cachedServers
	s.mu.RUnlock()

	var target *speedtest.Server
	for _, srv := range cached {
		if srv.ID == serverID {
			target = srv
			break
		}
	}

	if target == nil {
		return 0, fmt.Errorf("server ID %s not found", serverID)
	}

	client := s.createSpeedtestClient(cfg)
	target.Context = client

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := target.PingTestContext(ctx, nil)
	if err != nil {
		return 0, s.mapNetworkError(err)
	}

	return target.Latency.Milliseconds(), nil
}

// ValidateAndPrepareCustomServer validates a custom server URL and verifies its connectivity.
func (s *Service) ValidateAndPrepareCustomServer(customURL string, cfg settings.NetworkSettings) (*ServerInfo, error) {
	trimmed := strings.TrimSpace(customURL)
	if trimmed == "" {
		return nil, errors.New("custom server URL cannot be empty")
	}

	u, err := url.Parse(trimmed)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https" && u.Scheme != "tcp") {
		return nil, errors.New("malformed URL: supported schemes are http://, https://, or tcp://")
	}

	srv, err := speedtest.CustomServer(trimmed)
	if err != nil {
		return nil, s.mapNetworkError(err)
	}

	client := s.createSpeedtestClient(cfg)
	srv.Context = client

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	// Ping check exclusively to test connectivity and estimate latency
	if err := srv.PingTestContext(ctx, nil); err != nil {
		return nil, fmt.Errorf("custom server verification failed: %w", s.mapNetworkError(err))
	}

	s.mu.Lock()
	s.customServer = srv
	s.mu.Unlock()

	info := &ServerInfo{
		ID:        srv.ID,
		Name:      srv.Name,
		Sponsor:   srv.Sponsor,
		Country:   srv.Country,
		City:      srv.Name,
		Distance:  srv.Distance,
		LatencyMs: srv.Latency.Milliseconds(),
		URL:       srv.URL,
		Host:      srv.Host,
		Available: true,
	}
	return info, nil
}

// StartUploadTest initiates an upload measurement session.
func (s *Service) StartUploadTest(cfg settings.NetworkSettings) (*TestResult, error) {
	cfg.TestMode = "upload"
	return s.StartTest(cfg)
}

// StartDownloadTest initiates a download measurement session.
func (s *Service) StartDownloadTest(cfg settings.NetworkSettings) (*TestResult, error) {
	cfg.TestMode = "download"
	return s.StartTest(cfg)
}

// StartTest initiates a speed measurement session based on cfg.TestMode ("both", "download", or "upload").
func (s *Service) StartTest(cfg settings.NetworkSettings) (*TestResult, error) {
	s.mu.Lock()
	// Single active test constraint
	if s.state != StateIdle && s.state != StateCompleted && s.state != StateCancelled && s.state != StateFailed {
		s.mu.Unlock()
		return nil, errors.New("another test is already in progress")
	}

	// Default test mode
	testMode := strings.ToLower(strings.TrimSpace(cfg.TestMode))
	if testMode != "download" && testMode != "upload" && testMode != "both" {
		testMode = "both"
	}
	cfg.TestMode = testMode

	// Wait for any residual workers to guarantee clean state
	s.workerWG.Wait()

	sessionID := fmt.Sprintf("session-%d", time.Now().UnixNano())
	ctx, cancel := context.WithCancel(context.Background())
	s.activeSessionID = sessionID
	s.cancelFunc = cancel
	s.state = StateDiscoveringServers
	s.workerWG.Add(1)
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		if s.cancelFunc != nil {
			s.cancelFunc()
		}
		s.mu.Unlock()
		s.workerWG.Done()
	}()

	s.transition(StateDiscoveringServers, sessionID, "Finding optimal speedtest server...", 10, "")

	client := s.createSpeedtestClient(cfg)

	var targetServer *speedtest.Server

	// Determine server based on selection mode
	switch cfg.ServerSelectionMode {
	case "custom":
		s.mu.RLock()
		targetServer = s.customServer
		s.mu.RUnlock()
		if targetServer == nil && cfg.CustomServerURL != "" {
			var err error
			targetServer, err = speedtest.CustomServer(cfg.CustomServerURL)
			if err != nil {
				s.transition(StateFailed, sessionID, "Failed to initialize custom server: "+err.Error(), 0, "")
				return nil, err
			}
		}
		if targetServer == nil {
			err := errors.New("no custom server configured")
			s.transition(StateFailed, sessionID, err.Error(), 0, "")
			return nil, err
		}

	case "manual":
		if cfg.SelectedServerID == "" {
			err := errors.New("manual server selection enabled but no server selected")
			s.transition(StateFailed, sessionID, err.Error(), 0, "")
			return nil, err
		}
		s.mu.RLock()
		for _, srv := range s.cachedServers {
			if srv.ID == cfg.SelectedServerID {
				targetServer = srv
				break
			}
		}
		s.mu.RUnlock()
		if targetServer == nil {
			// Fetch and find
			servers, err := client.FetchServerListContext(ctx)
			if err != nil {
				s.transition(StateFailed, sessionID, s.mapNetworkError(err).Error(), 0, "")
				return nil, err
			}
			s.cachedServers = servers
			for _, srv := range servers {
				if srv.ID == cfg.SelectedServerID {
					targetServer = srv
					break
				}
			}
		}

	default: // "auto"
		s.transition(StateDiscoveringServers, sessionID, "Discovering closest servers...", 15, "")
		servers, err := client.FetchServerListContext(ctx)
		if err != nil {
			mappedErr := s.mapNetworkError(err)
			s.transition(StateFailed, sessionID, mappedErr.Error(), 0, "")
			return nil, mappedErr
		}
		if len(servers) == 0 {
			err := errors.New("no available servers found")
			s.transition(StateFailed, sessionID, err.Error(), 0, "")
			return nil, err
		}

		s.mu.Lock()
		s.cachedServers = servers
		s.mu.Unlock()

		s.transition(StateMeasuringLatency, sessionID, "Measuring latency and jitter...", 25, "")
		count := 5
		if len(servers) < count {
			count = len(servers)
		}

		var bestServer *speedtest.Server
		var lowestPing time.Duration = time.Hour

		for i := 0; i < count; i++ {
			if ctx.Err() != nil {
				s.transition(StateCancelled, sessionID, "Test cancelled", 0, "")
				return nil, ctx.Err()
			}
			candidate := servers[i]
			if err := candidate.PingTestContext(ctx, nil); err == nil {
				if candidate.Latency < lowestPing {
					lowestPing = candidate.Latency
					bestServer = candidate
				}
			}
		}

		if bestServer != nil {
			targetServer = bestServer
		} else {
			targetServer = servers[0]
		}
	}

	if targetServer == nil {
		err := errors.New("unable to select a suitable server")
		s.transition(StateFailed, sessionID, err.Error(), 0, "")
		return nil, err
	}

	// Check if cancelled before starting tests
	if ctx.Err() != nil {
		s.transition(StateCancelled, sessionID, "Test cancelled", 0, "")
		return nil, ctx.Err()
	}

	// Measure thorough ping and jitter on chosen server
	s.transition(StateMeasuringLatency, sessionID, "Measuring ping and jitter...", 30, targetServer.ID)
	_ = targetServer.PingTestContext(ctx, nil)

	latencyMs := targetServer.Latency.Milliseconds()
	jitterMs := float64(targetServer.Jitter.Nanoseconds()) / 1e6

	// Dispatch initial ping & jitter metric
	s.mu.Lock()
	if s.callbacks.OnMetrics != nil {
		cb := s.callbacks.OnMetrics
		s.mu.Unlock()
		cb(LiveMetrics{
			Phase:     "latency",
			SessionID: sessionID,
			Timestamp: time.Now(),
			LatencyMs: latencyMs,
			JitterMs:  jitterMs,
		})
	} else {
		s.mu.Unlock()
	}

	duration := time.Duration(cfg.DurationSeconds) * time.Second
	if duration <= 0 {
		duration = 10 * time.Second
	}

	activeWorkersCount := 8
	if cfg.WorkerCount > 0 {
		activeWorkersCount = cfg.WorkerCount
	}

	var avgDownloadSpeedBps float64
	var peakDownloadSpeedBps float64
	var downloadBytes int64

	var avgUploadSpeedBps float64
	var peakUploadSpeedBps float64
	var finalStableSpeedBps float64
	var uploadBytes int64
	var serverConfirmedBytes int64
	var serverConfirmedRatio float64

	startTime := time.Now()

	// ----------------------------------------------------
	// DOWNLOAD PHASE (if testMode is "download" or "both")
	// ----------------------------------------------------
	if testMode == "download" || testMode == "both" {
		if ctx.Err() != nil {
			s.transition(StateCancelled, sessionID, "Test cancelled", 0, targetServer.ID)
			return nil, ctx.Err()
		}

		s.transition(StateDownloading, sessionID, "Starting download speed test...", 35, targetServer.ID)

		targetServer.Context.Reset()
		targetServer.Context.SetCaptureTime(duration)
		targetServer.Context.SetRateCaptureFrequency(100 * time.Millisecond)
		targetServer.Context.SetNThread(cfg.WorkerCount)

		dlStartTime := time.Now()
		var lastDlBps float64

		targetServer.Context.SetCallbackDownload(func(rate speedtest.ByteRate) {
			currentBps := float64(rate) * 8.0
			lastDlBps = currentBps
			if currentBps > peakDownloadSpeedBps {
				peakDownloadSpeedBps = currentBps
			}

			now := time.Now()
			s.mu.Lock()
			if now.Sub(s.lastMetricTime) >= 100*time.Millisecond && s.callbacks.OnMetrics != nil && s.activeSessionID == sessionID {
				s.lastMetricTime = now
				elapsed := now.Sub(dlStartTime).Seconds()
				var progress float64
				if testMode == "both" {
					progress = 35.0 + (elapsed/duration.Seconds())*30.0
				} else {
					progress = 35.0 + (elapsed/duration.Seconds())*60.0
				}
				if progress > 99.0 {
					progress = 99.0
				}

				ewmaBps := float64(targetServer.Context.GetEWMADownloadRate()) * 8.0
				transferred := targetServer.Context.GetTotalDownload()

				metrics := LiveMetrics{
					Phase:            "download",
					SessionID:        sessionID,
					Timestamp:        now,
					CurrentSpeedBps:  currentBps,
					EWMASpeedBps:     ewmaBps,
					PeakSpeedBps:     peakDownloadSpeedBps,
					TransferredBytes: transferred,
					ElapsedSeconds:   now.Sub(startTime).Seconds(),
					ActiveWorkers:    activeWorkersCount,
					LatencyMs:        latencyMs,
					JitterMs:         jitterMs,
				}
				cb := s.callbacks.OnMetrics
				s.mu.Unlock()

				cb(metrics)
				s.transition(StateDownloading, sessionID, fmt.Sprintf("Downloading... %.1f s left", duration.Seconds()-elapsed), progress, targetServer.ID)
			} else {
				s.mu.Unlock()
			}
		})

		dlErr := targetServer.DownloadTestContext(ctx)
		if ctx.Err() != nil {
			s.transition(StateCancelled, sessionID, "Test cancelled", 0, targetServer.ID)
			return nil, ctx.Err()
		}
		if dlErr != nil {
			mappedErr := s.mapNetworkError(dlErr)
			s.transition(StateFailed, sessionID, mappedErr.Error(), 0, targetServer.ID)
			return nil, mappedErr
		}

		avgDownloadSpeedBps = float64(targetServer.DLSpeed) * 8.0
		if avgDownloadSpeedBps <= 0 {
			avgDownloadSpeedBps = lastDlBps
		}
		if peakDownloadSpeedBps < avgDownloadSpeedBps {
			peakDownloadSpeedBps = avgDownloadSpeedBps
		}
		downloadBytes = targetServer.Context.GetTotalDownload()
	}

	// ----------------------------------------------------
	// UPLOAD PHASE (if testMode is "upload" or "both")
	// ----------------------------------------------------
	if testMode == "upload" || testMode == "both" {
		if ctx.Err() != nil {
			s.transition(StateCancelled, sessionID, "Test cancelled", 0, targetServer.ID)
			return nil, ctx.Err()
		}

		startProgress := 35.0
		if testMode == "both" {
			startProgress = 65.0
		}
		s.transition(StateUploading, sessionID, "Starting upload speed test...", startProgress, targetServer.ID)

		targetServer.Context.Reset()
		targetServer.Context.SetCaptureTime(duration)
		targetServer.Context.SetRateCaptureFrequency(100 * time.Millisecond)
		targetServer.Context.SetNThread(cfg.WorkerCount)

		ulStartTime := time.Now()
		var lastUlBps float64

		targetServer.Context.SetCallbackUpload(func(rate speedtest.ByteRate) {
			currentBps := float64(rate) * 8.0
			lastUlBps = currentBps
			if currentBps > peakUploadSpeedBps {
				peakUploadSpeedBps = currentBps
			}

			now := time.Now()
			s.mu.Lock()
			if now.Sub(s.lastMetricTime) >= 100*time.Millisecond && s.callbacks.OnMetrics != nil && s.activeSessionID == sessionID {
				s.lastMetricTime = now
				elapsed := now.Sub(ulStartTime).Seconds()
				var progress float64
				if testMode == "both" {
					progress = 65.0 + (elapsed/duration.Seconds())*34.0
				} else {
					progress = 35.0 + (elapsed/duration.Seconds())*64.0
				}
				if progress > 99.0 {
					progress = 99.0
				}

				ewmaBps := float64(targetServer.Context.GetEWMAUploadRate()) * 8.0
				transferred := downloadBytes + targetServer.Context.GetTotalUpload()
				confirmedBytes := targetServer.Context.GetTotalUpload()
				ratio := targetServer.Context.GetUploadConfirmationRatio()

				metrics := LiveMetrics{
					Phase:                 "upload",
					SessionID:             sessionID,
					Timestamp:             now,
					CurrentSpeedBps:       currentBps,
					EWMASpeedBps:          ewmaBps,
					PeakSpeedBps:          peakUploadSpeedBps,
					TransferredBytes:      transferred,
					ServerConfirmedBytes:  confirmedBytes,
					ServerConfirmedRatio:  ratio,
					ElapsedSeconds:        now.Sub(startTime).Seconds(),
					ActiveWorkers:         activeWorkersCount,
					ServerConfirmedNotice: "Server-confirmed data",
					LatencyMs:             latencyMs,
					JitterMs:              jitterMs,
				}
				cb := s.callbacks.OnMetrics
				s.mu.Unlock()

				cb(metrics)
				s.transition(StateUploading, sessionID, fmt.Sprintf("Uploading... %.1f s left", duration.Seconds()-elapsed), progress, targetServer.ID)
			} else {
				s.mu.Unlock()
			}
		})

		ulErr := targetServer.UploadTestContext(ctx)
		if ctx.Err() != nil {
			s.transition(StateCancelled, sessionID, "Test cancelled", 0, targetServer.ID)
			return nil, ctx.Err()
		}
		if ulErr != nil {
			mappedErr := s.mapNetworkError(ulErr)
			s.transition(StateFailed, sessionID, mappedErr.Error(), 0, targetServer.ID)
			return nil, mappedErr
		}

		finalStableSpeedBps = lastUlBps
		avgUploadSpeedBps = float64(targetServer.ULSpeed) * 8.0
		if avgUploadSpeedBps <= 0 {
			avgUploadSpeedBps = lastUlBps
		}
		if peakUploadSpeedBps < avgUploadSpeedBps {
			peakUploadSpeedBps = avgUploadSpeedBps
		}
		uploadBytes = targetServer.Context.GetTotalUpload()
		serverConfirmedBytes = uploadBytes
		serverConfirmedRatio = targetServer.Context.GetUploadConfirmationRatio()
	}

	elapsedTotal := time.Since(startTime).Seconds()
	totalTransferredBytes := downloadBytes + uploadBytes

	result := &TestResult{
		SessionID:            sessionID,
		Success:              true,
		Server:               s.serverToInfo(targetServer),
		TestMode:             testMode,
		AvgDownloadSpeedBps:  avgDownloadSpeedBps,
		PeakDownloadSpeedBps: peakDownloadSpeedBps,
		AvgUploadSpeedBps:    avgUploadSpeedBps,
		PeakUploadSpeedBps:   peakUploadSpeedBps,
		FinalStableSpeedBps:  finalStableSpeedBps,
		DurationSeconds:      elapsedTotal,
		DownloadBytes:        downloadBytes,
		UploadBytes:          uploadBytes,
		TransferredBytes:     totalTransferredBytes,
		ServerConfirmedBytes: serverConfirmedBytes,
		ServerConfirmedRatio: serverConfirmedRatio,
		LatencyMs:            latencyMs,
		JitterMs:             jitterMs,
		MinLatencyMs:         targetServer.MinLatency.Milliseconds(),
		MaxLatencyMs:         targetServer.MaxLatency.Milliseconds(),
		ExecutionTimeStr:     time.Now().Format("2006-01-02 15:04:05"),
		Timestamp:            time.Now(),
		Protocol:             cfg.Protocol,
	}

	targetServer.Context.Reset()

	s.transition(StateCompleted, sessionID, "Speed test completed successfully", 100, targetServer.ID)
	return result, nil
}

func (s *Service) transition(st State, sessionID, message string, progress float64, serverID string) {
	s.mu.Lock()
	s.state = st
	info := StateInfo{
		State:            st,
		SessionID:        sessionID,
		Message:          message,
		ProgressPercent:  progress,
		SelectedServerID: serverID,
	}
	cb := s.callbacks.OnStateChange
	s.mu.Unlock()

	if cb != nil {
		cb(info)
	}
}

func (s *Service) createSpeedtestClient(cfg settings.NetworkSettings) *speedtest.Speedtest {
	uc := &speedtest.UserConfig{
		UserAgent:      cfg.UserAgent,
		Proxy:          cfg.ProxyURL,
		Source:         cfg.SourceIP,
		SavingMode:     cfg.SavingMode,
		MaxConnections: cfg.WorkerCount,
		CityFlag:       cfg.VirtualCity,
		Keyword:        cfg.ServerSearchKeyword,
	}

	if cfg.Protocol == "tcp" {
		uc.TestMode = speedtest.TCPTest
	} else {
		uc.TestMode = speedtest.HTTPTest
	}

	switch cfg.LatencyMode {
	case "tcp":
		uc.PingMode = speedtest.TCP
	case "icmp":
		uc.PingMode = speedtest.ICMP
	default:
		uc.PingMode = speedtest.HTTP
	}

	return speedtest.New(speedtest.WithUserConfig(uc))
}

func (s *Service) mapNetworkError(err error) error {
	if err == nil {
		return nil
	}
	errStr := err.Error()

	if errors.Is(err, context.Canceled) {
		return errors.New("test cancelled")
	}
	if errors.Is(err, context.DeadlineExceeded) || strings.Contains(errStr, "timeout") {
		return errors.New("network timeout: the server or connection took too long to respond")
	}
	if strings.Contains(errStr, "no such host") || strings.Contains(errStr, "lookup") {
		return errors.New("DNS resolution failed: unable to resolve server address")
	}
	if strings.Contains(errStr, "connection refused") {
		return errors.New("connection refused by remote server")
	}
	if strings.Contains(errStr, "certificate") || strings.Contains(errStr, "tls") || strings.Contains(errStr, "handshake") {
		return errors.New("TLS/SSL security handshake failed: certificate untrusted or invalid")
	}
	if strings.Contains(errStr, "network is unreachable") || strings.Contains(errStr, "no route to host") {
		return errors.New("internet disconnected or network unreachable: check your connection or firewall")
	}
	if strings.Contains(errStr, "proxy") {
		return errors.New("proxy error: failed to connect through configured proxy")
	}

	return fmt.Errorf("network error: %s", errStr)
}

func (s *Service) mapServersToInfo(servers speedtest.Servers) []ServerInfo {
	res := make([]ServerInfo, len(servers))
	for i, srv := range servers {
		res[i] = s.serverToInfo(srv)
	}
	return res
}

func (s *Service) serverToInfo(srv *speedtest.Server) ServerInfo {
	if srv == nil {
		return ServerInfo{Name: "Unavailable"}
	}
	return ServerInfo{
		ID:          srv.ID,
		Name:        srv.Name,
		Sponsor:     srv.Sponsor,
		Country:     srv.Country,
		CountryCode: srv.Country,
		City:        srv.Name,
		Distance:    srv.Distance,
		LatencyMs:   srv.Latency.Milliseconds(),
		JitterMs:    float64(srv.Jitter.Nanoseconds()) / 1e6,
		MinLatency:  srv.MinLatency.Milliseconds(),
		MaxLatency:  srv.MaxLatency.Milliseconds(),
		URL:         srv.URL,
		Host:        srv.Host,
		Available:   true,
	}
}
