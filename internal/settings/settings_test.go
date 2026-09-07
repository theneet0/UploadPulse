package settings

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDefaultSettings(t *testing.T) {
	s := DefaultSettings()
	if s.Network.DurationSeconds != 10 {
		t.Errorf("expected 10s default duration, got %d", s.Network.DurationSeconds)
	}
	if s.Network.WorkerCount != 0 {
		t.Errorf("expected 0 (auto) worker count, got %d", s.Network.WorkerCount)
	}
	if s.Display.SpeedUnit != "Mbps" {
		t.Errorf("expected Mbps default unit, got %s", s.Display.SpeedUnit)
	}
	if s.Display.Language != "en" {
		t.Errorf("expected en default language, got %s", s.Display.Language)
	}
}

func TestValidationBounds(t *testing.T) {
	s := DefaultSettings()
	s.Network.DurationSeconds = 9999
	s.Network.WorkerCount = 100
	s.Display.DecimalPrecision = 10
	s.History.MaxRecords = 5

	validated, err := ValidateSettings(s)
	if err != nil {
		t.Fatalf("unexpected validation error: %v", err)
	}

	if validated.Network.DurationSeconds != 300 {
		t.Errorf("expected duration clamped to 300, got %d", validated.Network.DurationSeconds)
	}
	if validated.Network.WorkerCount != 32 {
		t.Errorf("expected workers clamped to 32, got %d", validated.Network.WorkerCount)
	}
	if validated.Display.DecimalPrecision != 3 {
		t.Errorf("expected precision clamped to 3, got %d", validated.Display.DecimalPrecision)
	}
	if validated.History.MaxRecords != 10 {
		t.Errorf("expected max records clamped to 10, got %d", validated.History.MaxRecords)
	}
}

func TestValidationSourceIP(t *testing.T) {
	s := DefaultSettings()
	s.Network.SourceIP = "192.168.1.100"
	val, err := ValidateSettings(s)
	if err != nil {
		t.Fatalf("expected valid IP to pass, got: %v", err)
	}
	if val.Network.SourceIP != "192.168.1.100" {
		t.Errorf("expected IP preserved, got %s", val.Network.SourceIP)
	}

	// Linux-style interface name should fail on Windows
	s.Network.SourceIP = "eth0"
	_, err = ValidateSettings(s)
	if err == nil {
		t.Errorf("expected interface name 'eth0' to fail on Windows")
	}
}

func TestAtomicSaveAndCorruptedRecovery(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "uploadpulse-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	settingsPath := filepath.Join(tmpDir, "settings.json")
	mgr, err := NewManager(settingsPath)
	if err != nil {
		t.Fatalf("failed to create manager: %v", err)
	}

	cur := mgr.Get()
	cur.Network.DurationSeconds = 15
	cur.Display.SpeedUnit = "MB/s"
	if err := mgr.Update(cur); err != nil {
		t.Fatalf("failed to update: %v", err)
	}

	// Reopen manager and verify persisted values
	mgr2, err := NewManager(settingsPath)
	if err != nil {
		t.Fatalf("failed to reload manager: %v", err)
	}
	loaded := mgr2.Get()
	if loaded.Network.DurationSeconds != 15 || loaded.Display.SpeedUnit != "MB/s" {
		t.Errorf("persisted settings mismatch: duration=%d, unit=%s", loaded.Network.DurationSeconds, loaded.Display.SpeedUnit)
	}

	// Write corrupted data
	if err := os.WriteFile(settingsPath, []byte("{invalid-json-content..."), 0600); err != nil {
		t.Fatal(err)
	}

	// Manager should recover gracefully by restoring defaults and backing up corrupt file
	mgr3, err := NewManager(settingsPath)
	if err != nil {
		t.Fatalf("manager should not fail completely on corrupt file: %v", err)
	}
	recovered := mgr3.Get()
	if recovered.Network.DurationSeconds != 10 {
		t.Errorf("expected default 10s duration after recovery, got %d", recovered.Network.DurationSeconds)
	}

	// Verify backup exists
	if _, err := os.Stat(settingsPath + ".corrupt"); os.IsNotExist(err) {
		t.Errorf("expected .corrupt backup file to exist")
	}
}
