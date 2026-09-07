package history

import (
	"time"

	"github.com/uploadpulse/uploadpulse/internal/settings"
)

// ServerSnapshot holds server details preserved at test completion.
type ServerSnapshot struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Sponsor  string  `json:"sponsor"`
	Country  string  `json:"country"`
	City     string  `json:"city"`
	Distance float64 `json:"distanceKm"`
	Latency  int64   `json:"latencyMs"`
	Host     string  `json:"host"`
}

// Record represents a single persisted test run in history.
type Record struct {
	ID                     string                   `json:"id"`
	Timestamp              time.Time                `json:"timestamp"`
	Success                bool                     `json:"success"`
	ErrorMessage           string                   `json:"errorMessage,omitempty"`
	AvgUploadSpeedBps      float64                  `json:"avgUploadSpeedBps"`
	PeakUploadSpeedBps     float64                  `json:"peakUploadSpeedBps"`
	FinalStableSpeedBps    float64                  `json:"finalStableSpeedBps"`
	DurationSeconds        float64                  `json:"durationSeconds"`
	TransferredBytes       int64                    `json:"transferredBytes"`
	ServerConfirmedBytes   int64                    `json:"serverConfirmedBytes"`
	ServerConfirmedRatio   float64                  `json:"serverConfirmedRatio"`
	LatencyMs              int64                    `json:"latencyMs"`
	Server                 ServerSnapshot           `json:"server"`
	EffectiveSettings      settings.NetworkSettings `json:"effectiveSettings"`
	ClientIP               string                   `json:"clientIP,omitempty"`
	ISP                    string                   `json:"isp,omitempty"`
}
