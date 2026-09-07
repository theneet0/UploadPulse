package main

import (
	"context"
	"fmt"
	"sync"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/uploadpulse/uploadpulse/internal/export"
	"github.com/uploadpulse/uploadpulse/internal/history"
	"github.com/uploadpulse/uploadpulse/internal/localization"
	"github.com/uploadpulse/uploadpulse/internal/settings"
	"github.com/uploadpulse/uploadpulse/internal/speedtestservice"
)

// App struct represents the core desktop application backend.
type App struct {
	ctx             context.Context
	mu              sync.Mutex
	settingsMgr     *settings.Manager
	historyMgr      *history.Manager
	speedtestSvc    *speedtestservice.Service
	lastTestResult  *speedtestservice.TestResult
}

// NewApp creates a new App application struct.
func NewApp() *App {
	sMgr, err := settings.NewManager()
	if err != nil {
		fmt.Printf("Warning: failed to initialize settings manager: %v\n", err)
	}

	hMgr, err := history.NewManager()
	if err != nil {
		fmt.Printf("Warning: failed to initialize history manager: %v\n", err)
	}

	app := &App{
		settingsMgr: sMgr,
		historyMgr:  hMgr,
	}

	svc := speedtestservice.NewService(speedtestservice.EventCallback{
		OnStateChange: func(si speedtestservice.StateInfo) {
			if app.ctx != nil {
				wailsRuntime.EventsEmit(app.ctx, "test:state", si)
			}
		},
		OnMetrics: func(m speedtestservice.LiveMetrics) {
			if app.ctx != nil {
				wailsRuntime.EventsEmit(app.ctx, "test:metrics", m)
			}
		},
	})
	app.speedtestSvc = svc

	return app
}

// Startup is called when the app starts. The context is saved so we can call runtime methods.
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// Shutdown is called when the app terminates. It guarantees clean cancellation of any active test.
func (a *App) Shutdown(ctx context.Context) {
	if a.speedtestSvc != nil {
		_ = a.speedtestSvc.CancelTest()
	}
}

// GetSettings retrieves current application settings.
func (a *App) GetSettings() settings.AppSettings {
	if a.settingsMgr == nil {
		return settings.DefaultSettings()
	}
	return a.settingsMgr.Get()
}

// UpdateSettings updates and persists application settings.
func (a *App) UpdateSettings(newSettings settings.AppSettings) (settings.AppSettings, error) {
	if a.settingsMgr == nil {
		var err error
		a.settingsMgr, err = settings.NewManager()
		if err != nil {
			return settings.DefaultSettings(), err
		}
	}
	if err := a.settingsMgr.Update(newSettings); err != nil {
		return a.settingsMgr.Get(), err
	}
	return a.settingsMgr.Get(), nil
}

// GetHistory returns all recorded test history.
func (a *App) GetHistory() []history.Record {
	if a.historyMgr == nil {
		return nil
	}
	return a.historyMgr.GetAll()
}

// QueryHistory filters and sorts recorded test history.
func (a *App) QueryHistory(search string, sortBy string, desc bool) []history.Record {
	if a.historyMgr == nil {
		return nil
	}
	return a.historyMgr.Query(search, sortBy, desc)
}

// DeleteHistoryRecord removes a specific record by ID.
func (a *App) DeleteHistoryRecord(id string) error {
	if a.historyMgr == nil {
		return fmt.Errorf("history manager not initialized")
	}
	return a.historyMgr.DeleteRecord(id)
}

// ClearHistory deletes all stored test records.
func (a *App) ClearHistory() error {
	if a.historyMgr == nil {
		return fmt.Errorf("history manager not initialized")
	}
	return a.historyMgr.ClearAll()
}

// ExportCSV produces a formula-injection-safe CSV of history records.
func (a *App) ExportCSV() (string, error) {
	if a.historyMgr == nil {
		return "", fmt.Errorf("history manager not initialized")
	}
	records := a.historyMgr.GetAll()
	curSettings := a.GetSettings()
	return export.GenerateCSV(records, curSettings.Display.MaskSensitiveData, curSettings.Display.SpeedUnit, curSettings.Display.DecimalPrecision)
}

// ExportJSON produces a clean pretty JSON of history records.
func (a *App) ExportJSON() (string, error) {
	if a.historyMgr == nil {
		return "", fmt.Errorf("history manager not initialized")
	}
	records := a.historyMgr.GetAll()
	curSettings := a.GetSettings()
	return export.GenerateJSON(records, curSettings.Display.MaskSensitiveData)
}

// CopySummary generates a formatted text summary for clipboard copying.
func (a *App) CopySummary(recordID string, includeServer bool) (string, error) {
	if a.historyMgr == nil {
		return "", fmt.Errorf("history manager not initialized")
	}
	records := a.historyMgr.GetAll()
	var target *history.Record
	for _, r := range records {
		if r.ID == recordID {
			recCopy := r
			target = &recCopy
			break
		}
	}

	if target == nil {
		// If not in history, use last test result
		a.mu.Lock()
		last := a.lastTestResult
		a.mu.Unlock()
		if last != nil {
			r := history.Record{
				ID:                   last.SessionID,
				Timestamp:            last.Timestamp,
				Success:              last.Success,
				ErrorMessage:         last.ErrorMessage,
				AvgUploadSpeedBps:    last.AvgUploadSpeedBps,
				PeakUploadSpeedBps:   last.PeakUploadSpeedBps,
				FinalStableSpeedBps:  last.FinalStableSpeedBps,
				DurationSeconds:      last.DurationSeconds,
				TransferredBytes:     last.TransferredBytes,
				ServerConfirmedBytes: last.ServerConfirmedBytes,
				ServerConfirmedRatio: last.ServerConfirmedRatio,
				LatencyMs:            last.LatencyMs,
				ClientIP:             last.ClientIP,
				Server: history.ServerSnapshot{
					ID:       last.Server.ID,
					Name:     last.Server.Name,
					Sponsor:  last.Server.Sponsor,
					Country:  last.Server.Country,
					City:     last.Server.City,
					Distance: last.Server.Distance,
					Latency:  last.Server.LatencyMs,
					Host:     last.Server.Host,
				},
				EffectiveSettings: a.GetSettings().Network,
			}
			target = &r
		}
	}

	if target == nil {
		return "", fmt.Errorf("no test result found to summarize")
	}

	curSettings := a.GetSettings()
	return export.GenerateResultSummary(*target, includeServer, curSettings.Display.MaskSensitiveData, curSettings.Display.SpeedUnit, curSettings.Display.DecimalPrecision), nil
}

// DiscoverServers retrieves available speedtest servers.
func (a *App) DiscoverServers() ([]speedtestservice.ServerInfo, error) {
	if a.speedtestSvc == nil {
		return nil, fmt.Errorf("speedtest service not initialized")
	}
	cfg := a.GetSettings().Network
	return a.speedtestSvc.DiscoverServers(cfg)
}

// PingServer measures ping latency to a specific server.
func (a *App) PingServer(serverID string) (int64, error) {
	if a.speedtestSvc == nil {
		return 0, fmt.Errorf("speedtest service not initialized")
	}
	cfg := a.GetSettings().Network
	return a.speedtestSvc.PingServer(serverID, cfg)
}

// ValidateCustomServer verifies connectivity to a custom speedtest server URL.
func (a *App) ValidateCustomServer(customURL string) (*speedtestservice.ServerInfo, error) {
	if a.speedtestSvc == nil {
		return nil, fmt.Errorf("speedtest service not initialized")
	}
	cfg := a.GetSettings().Network
	return a.speedtestSvc.ValidateAndPrepareCustomServer(customURL, cfg)
}

// StartTest initiates an upload speed measurement.
// Strictly NEVER executes download speed tests.
func (a *App) StartTest() (*speedtestservice.TestResult, error) {
	if a.speedtestSvc == nil {
		return nil, fmt.Errorf("speedtest service not initialized")
	}

	curSettings := a.GetSettings()
	res, err := a.speedtestSvc.StartUploadTest(curSettings.Network)
	if err != nil {
		return nil, err
	}

	a.mu.Lock()
	a.lastTestResult = res
	a.mu.Unlock()

	// Persist to history if success
	if res.Success && a.historyMgr != nil {
		rec := history.Record{
			ID:                   res.SessionID,
			Timestamp:            res.Timestamp,
			Success:              true,
			AvgUploadSpeedBps:    res.AvgUploadSpeedBps,
			PeakUploadSpeedBps:   res.PeakUploadSpeedBps,
			FinalStableSpeedBps:  res.FinalStableSpeedBps,
			DurationSeconds:      res.DurationSeconds,
			TransferredBytes:     res.TransferredBytes,
			ServerConfirmedBytes: res.ServerConfirmedBytes,
			ServerConfirmedRatio: res.ServerConfirmedRatio,
			LatencyMs:            res.LatencyMs,
			ClientIP:             res.ClientIP,
			ISP:                  res.ISP,
			Server: history.ServerSnapshot{
				ID:       res.Server.ID,
				Name:     res.Server.Name,
				Sponsor:  res.Server.Sponsor,
				Country:  res.Server.Country,
				City:     res.Server.City,
				Distance: res.Server.Distance,
				Latency:  res.Server.LatencyMs,
				Host:     res.Server.Host,
			},
			EffectiveSettings: curSettings.Network,
		}
		_ = a.historyMgr.AddRecord(rec, curSettings.History)
	}

	// Show Windows desktop notification if enabled
	if curSettings.Display.CompletionNotification && a.ctx != nil {
		speedStr := export.FormatSpeed(res.AvgUploadSpeedBps, curSettings.Display.SpeedUnit, curSettings.Display.DecimalPrecision)
		wailsRuntime.EventsEmit(a.ctx, "app:notify", map[string]string{
			"title":   "UploadPulse Test Completed",
			"message": fmt.Sprintf("Upload Speed: %s (Latency: %d ms)", speedStr, res.LatencyMs),
		})
	}

	return res, nil
}

// CancelTest requests immediate cancellation of an active test.
func (a *App) CancelTest() error {
	if a.speedtestSvc == nil {
		return nil
	}
	return a.speedtestSvc.CancelTest()
}

// GetLocale returns translation strings and text direction for the requested language.
func (a *App) GetLocale(lang string) localization.LocaleData {
	return localization.GetLocale(lang)
}
