package history

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/uploadpulse/uploadpulse/internal/settings"
)

func TestHistoryManager(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "uploadpulse-hist-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	histPath := filepath.Join(tmpDir, "history.json")
	mgr, err := NewManager(histPath)
	if err != nil {
		t.Fatalf("failed to create history manager: %v", err)
	}

	histSettings := settings.HistorySettings{
		MaxRecords:    3,
		RetentionDays: 30,
	}

	// Add 4 records (exceeding MaxRecords of 3)
	for i := 1; i <= 4; i++ {
		rec := Record{
			ID:                string(rune('A' + i - 1)),
			Timestamp:         time.Now().Add(time.Duration(i) * time.Minute),
			Success:           true,
			AvgUploadSpeedBps: float64(i * 10000000), // 10, 20, 30, 40 Mbps
			LatencyMs:         int64(50 - i*5),
			DurationSeconds:   10,
			Server: ServerSnapshot{
				ID:      "srv-1",
				Name:    "Frankfurt Server",
				City:    "Frankfurt",
				Country: "DE",
			},
		}
		if err := mgr.AddRecord(rec, histSettings); err != nil {
			t.Fatalf("failed to add record: %v", err)
		}
	}

	all := mgr.GetAll()
	if len(all) != 3 {
		t.Fatalf("expected 3 records due to MaxRecords pruning, got %d", len(all))
	}

	// Verify newest record is first
	if all[0].ID != "D" {
		t.Errorf("expected newest record 'D' to be first, got %s", all[0].ID)
	}

	// Test Search
	res := mgr.Query("Frankfurt", "speed", true)
	if len(res) != 3 {
		t.Errorf("expected 3 results matching 'Frankfurt', got %d", len(res))
	}
	if res[0].AvgUploadSpeedBps < res[1].AvgUploadSpeedBps {
		t.Errorf("expected descending speed sort")
	}

	// Test Delete Record
	if err := mgr.DeleteRecord("D"); err != nil {
		t.Fatalf("failed to delete record: %v", err)
	}
	if len(mgr.GetAll()) != 2 {
		t.Errorf("expected 2 records after deletion, got %d", len(mgr.GetAll()))
	}

	// Test Clear All
	if err := mgr.ClearAll(); err != nil {
		t.Fatalf("failed to clear all: %v", err)
	}
	if len(mgr.GetAll()) != 0 {
		t.Errorf("expected 0 records after clear all, got %d", len(mgr.GetAll()))
	}
}
