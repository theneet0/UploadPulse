package history

import (
	"time"

	"github.com/uploadpulse/uploadpulse/internal/settings"
)

// ServerSnapshot holds server details preserved at test completion.
type ServerSnapshot struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Sponsor    string  `json:"sponsor"`
	Country    string  `json:"country"`
	City       string  `json:"city"`
	Distance   float64 `json:"distanceKm"`
	Latency    int64   `json:"latencyMs"`
	JitterMs   float64 `json:"jitterMs"`
	MinLatency int64   `json:"minLatencyMs"`
	MaxLatency int64   `json:"maxLatencyMs"`
	Host       string  `json:"host"`
}

// Record represents a single persisted test run in history.
type Record struct {
	ID                   string                   `json:"id"`
	Timestamp            time.Time                `json:"timestamp"`
	Success              bool                     `json:"success"`
	ErrorMessage         string                   `json:"errorMessage,omitempty"`
	TestMode             string                   `json:"testMode"` // "both", "download", "upload"
	AvgDownloadSpeedBps  float64                  `json:"avgDownloadSpeedBps"`
	PeakDownloadSpeedBps float64                  `json:"peakDownloadSpeedBps"`
	AvgUploadSpeedBps    float64                  `json:"avgUploadSpeedBps"`
	PeakUploadSpeedBps   float64                  `json:"peakUploadSpeedBps"`
	FinalStableSpeedBps  float64                  `json:"finalStableSpeedBps"`
	DurationSeconds      float64                  `json:"durationSeconds"`
	DownloadBytes        int64                    `json:"downloadBytes"`
	UploadBytes          int64                    `json:"uploadBytes"`
	TransferredBytes     int64                    `json:"transferredBytes"`
	ServerConfirmedBytes int64                    `json:"serverConfirmedBytes"`
	ServerConfirmedRatio float64                  `json:"serverConfirmedRatio"`
	LatencyMs            int64                    `json:"latencyMs"`
	JitterMs             float64                  `json:"jitterMs"`
	MinLatencyMs         int64                    `json:"minLatencyMs"`
	MaxLatencyMs         int64                    `json:"maxLatencyMs"`
	Server               ServerSnapshot           `json:"server"`
	EffectiveSettings    settings.NetworkSettings `json:"effectiveSettings"`
	ClientIP             string                   `json:"clientIP,omitempty"`
	ISP                  string                   `json:"isp,omitempty"`
}
