package speedtestservice

import "time"

// State represents the test lifecycle state.
type State string

const (
	StateIdle               State = "Idle"
	StateDiscoveringServers State = "DiscoveringServers"
	StateMeasuringLatency   State = "MeasuringLatency"
	StateDownloading        State = "Downloading"
	StateUploading          State = "Uploading"
	StateCompleted          State = "Completed"
	StateCancelled          State = "Cancelled"
	StateFailed             State = "Failed"
)

// StateInfo communicates current state and progress to the frontend.
type StateInfo struct {
	State            State   `json:"state"`
	SessionID        string  `json:"sessionId"`
	Message          string  `json:"message"`
	ProgressPercent  float64 `json:"progressPercent"`
	SelectedServerID string  `json:"selectedServerId,omitempty"`
}

// LiveMetrics is emitted during an active test every 100-200ms.
type LiveMetrics struct {
	Phase                 string    `json:"phase"` // "download", "upload", "latency", "idle"
	SessionID             string    `json:"sessionId"`
	Timestamp             time.Time `json:"timestamp"`
	CurrentSpeedBps       float64   `json:"currentSpeedBps"`
	EWMASpeedBps          float64   `json:"ewmaSpeedBps"`
	PeakSpeedBps          float64   `json:"peakSpeedBps"`
	TransferredBytes      int64     `json:"transferredBytes"`
	ServerConfirmedBytes  int64     `json:"serverConfirmedBytes"`
	ServerConfirmedRatio  float64   `json:"serverConfirmedRatio"` // from GetUploadConfirmationRatio()
	ElapsedSeconds        float64   `json:"elapsedSeconds"`
	ActiveWorkers         int       `json:"activeWorkers"`
	ServerConfirmedNotice string    `json:"serverConfirmedNotice"`
	LatencyMs             int64     `json:"latencyMs"`
	JitterMs              float64   `json:"jitterMs"`
}

// ServerInfo represents an Ookla or custom speedtest server.
type ServerInfo struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Sponsor     string  `json:"sponsor"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	City        string  `json:"city"`
	Distance    float64 `json:"distanceKm"`
	LatencyMs   int64   `json:"latencyMs"`
	JitterMs    float64 `json:"jitterMs"`
	MinLatency  int64   `json:"minLatencyMs"`
	MaxLatency  int64   `json:"maxLatencyMs"`
	URL         string  `json:"url"`
	Host        string  `json:"host"`
	Available   bool    `json:"available"`
}

// TestResult is returned upon test completion or failure.
type TestResult struct {
	SessionID            string     `json:"sessionId"`
	Success              bool       `json:"success"`
	ErrorMessage         string     `json:"errorMessage,omitempty"`
	Server               ServerInfo `json:"server"`
	TestMode             string     `json:"testMode"` // "both", "download", "upload"
	AvgDownloadSpeedBps  float64    `json:"avgDownloadSpeedBps"`
	PeakDownloadSpeedBps float64    `json:"peakDownloadSpeedBps"`
	AvgUploadSpeedBps    float64    `json:"avgUploadSpeedBps"`
	PeakUploadSpeedBps   float64    `json:"peakUploadSpeedBps"`
	FinalStableSpeedBps  float64    `json:"finalStableSpeedBps"`
	DurationSeconds      float64    `json:"durationSeconds"`
	DownloadBytes        int64      `json:"downloadBytes"`
	UploadBytes          int64      `json:"uploadBytes"`
	TransferredBytes     int64      `json:"transferredBytes"`
	ServerConfirmedBytes int64      `json:"serverConfirmedBytes"`
	ServerConfirmedRatio float64    `json:"serverConfirmedRatio"`
	LatencyMs            int64      `json:"latencyMs"`
	JitterMs             float64    `json:"jitterMs"`
	MinLatencyMs         int64      `json:"minLatencyMs"`
	MaxLatencyMs         int64      `json:"maxLatencyMs"`
	ExecutionTimeStr     string     `json:"executionTimeStr"`
	Timestamp            time.Time  `json:"timestamp"`
	Protocol             string     `json:"protocol"`
	ClientIP             string     `json:"clientIP,omitempty"`
	ISP                  string     `json:"isp,omitempty"`
}
