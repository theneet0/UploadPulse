package export

import (
	"strings"
	"testing"
	"time"

	"github.com/uploadpulse/uploadpulse/internal/history"
	"github.com/uploadpulse/uploadpulse/internal/settings"
)

func TestConvertSpeed(t *testing.T) {
	// 100,000,000 bps = 100 Mbps
	bps := 100000000.0

	mbps := ConvertSpeed(bps, "Mbps")
	if mbps != 100.0 {
		t.Errorf("expected 100.0 Mbps, got %f", mbps)
	}

	// 100 Mbps in MB/s (bytes): (100,000,000 / 8) / 1,000,000 = 12.5 MB/s
	mbPerSec := ConvertSpeed(bps, "MB/s")
	if mbPerSec != 12.5 {
		t.Errorf("expected 12.5 MB/s, got %f", mbPerSec)
	}

	// 100 Mbps in Kbps: 100,000 Kbps
	kbps := ConvertSpeed(bps, "Kbps")
	if kbps != 100000.0 {
		t.Errorf("expected 100000.0 Kbps, got %f", kbps)
	}

	// FormatSpeed check
	str := FormatSpeed(bps, "Mbps", 2)
	if str != "100.00 Mbps" {
		t.Errorf("expected '100.00 Mbps', got '%s'", str)
	}
}

func TestSanitizeCSVFormula(t *testing.T) {
	cases := []struct {
		input    string
		expected string
	}{
		{"=cmd|' /C calc'!A0", "'=cmd|' /C calc'!A0"},
		{"+12345", "'+12345"},
		{"-SUM(1,2)", "'-SUM(1,2)"},
		{"@SUM(1,2)", "'@SUM(1,2)"},
		{"\tmalicious", "'\tmalicious"},
		{"Safe Server Name", "Safe Server Name"},
	}

	for _, c := range cases {
		res := SanitizeCSVFormula(c.input)
		if res != c.expected {
			t.Errorf("SanitizeCSVFormula(%q) = %q, expected %q", c.input, res, c.expected)
		}
	}
}

func TestMaskIP(t *testing.T) {
	masked := MaskIP("192.168.1.55")
	if masked != "192.168.*.*" {
		t.Errorf("expected 192.168.*.*, got %s", masked)
	}

	empty := MaskIP("")
	if empty != "Unavailable" {
		t.Errorf("expected Unavailable for empty IP, got %s", empty)
	}
}

func TestGenerateCSVAndJSON(t *testing.T) {
	rec := history.Record{
		ID:                   "test-1",
		Timestamp:            time.Date(2026, 9, 6, 12, 0, 0, 0, time.UTC),
		Success:              true,
		AvgUploadSpeedBps:    50000000.0,
		PeakUploadSpeedBps:   60000000.0,
		FinalStableSpeedBps:  48000000.0,
		DurationSeconds:      10.0,
		TransferredBytes:     62500000,
		ServerConfirmedBytes: 60000000,
		ServerConfirmedRatio: 0.96,
		LatencyMs:            15,
		ClientIP:             "203.0.113.10",
		Server: history.ServerSnapshot{
			ID:       "=maliciousServer",
			Name:     "Cloud Server",
			Sponsor:  "Hosting Corp",
			Country:  "US",
			City:     "Dallas",
			Distance: 120.5,
		},
		EffectiveSettings: settings.NetworkSettings{
			Protocol: "http",
		},
	}

	// Test CSV
	csvStr, err := GenerateCSV([]history.Record{rec}, true, "Mbps", 2)
	if err != nil {
		t.Fatalf("CSV generation failed: %v", err)
	}

	if strings.Contains(csvStr, "203.0.113.10") {
		t.Errorf("CSV should have masked client IP when maskSensitive is true")
	}
	if !strings.Contains(csvStr, "'=maliciousServer") {
		t.Errorf("CSV should have sanitized malicious formula prefix '=maliciousServer'")
	}

	// Test JSON
	jsonStr, err := GenerateJSON([]history.Record{rec}, true)
	if err != nil {
		t.Fatalf("JSON generation failed: %v", err)
	}
	if strings.Contains(jsonStr, "203.0.113.10") {
		t.Errorf("JSON should have masked client IP")
	}

	// Test Summary
	summary := GenerateResultSummary(rec, true, true, "Mbps", 2)
	if !strings.Contains(summary, "Server-confirmed data") {
		t.Errorf("summary must include 'Server-confirmed data'")
	}
	if !strings.Contains(summary, "Average Upload: 50.00 Mbps") {
		t.Errorf("summary should contain formatted speed")
	}
	if strings.Contains(summary, "203.0.113.10") {
		t.Errorf("summary should not leak IP when masked")
	}
}
