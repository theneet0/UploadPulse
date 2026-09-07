package history

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/uploadpulse/uploadpulse/internal/platform/windows"
	"github.com/uploadpulse/uploadpulse/internal/settings"
)

// Manager manages loading, querying, and persisting test history.
type Manager struct {
	mu       sync.RWMutex
	filePath string
	dataDir  string
	records  []Record
}

// NewManager creates and initializes a History Manager.
func NewManager(customPath ...string) (*Manager, error) {
	var filePath string
	var dataDir string

	if len(customPath) > 0 && customPath[0] != "" {
		filePath = customPath[0]
		dataDir = filepath.Dir(filePath)
	} else {
		var err error
		dataDir, err = windows.GetAppDataDir()
		if err != nil {
			return nil, fmt.Errorf("failed to get app data dir: %w", err)
		}
		filePath = filepath.Join(dataDir, "history.json")
	}

	m := &Manager{
		filePath: filePath,
		dataDir:  dataDir,
		records:  make([]Record, 0),
	}

	_ = m.load()
	return m, nil
}

// AddRecord adds a test record and enforces retention policies.
func (m *Manager) AddRecord(rec Record, histSettings settings.HistorySettings) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Prepend new record so newest is first
	m.records = append([]Record{rec}, m.records...)

	// Enforce retention rules
	m.pruneUnlocked(histSettings)

	return m.saveAtomicUnlocked()
}

// GetAll returns a copy of all records.
func (m *Manager) GetAll() []Record {
	m.mu.RLock()
	defer m.mu.RUnlock()
	res := make([]Record, len(m.records))
	copy(res, m.records)
	return res
}

// Query filters and sorts records.
func (m *Manager) Query(searchTerm string, sortBy string, sortDesc bool) []Record {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var filtered []Record
	search := strings.ToLower(strings.TrimSpace(searchTerm))

	for _, r := range m.records {
		if search == "" {
			filtered = append(filtered, r)
			continue
		}

		match := strings.Contains(strings.ToLower(r.Server.Name), search) ||
			strings.Contains(strings.ToLower(r.Server.Sponsor), search) ||
			strings.Contains(strings.ToLower(r.Server.City), search) ||
			strings.Contains(strings.ToLower(r.Server.Country), search) ||
			strings.Contains(strings.ToLower(r.Server.ID), search)
		if match {
			filtered = append(filtered, r)
		}
	}

	// Sort
	sort.Slice(filtered, func(i, j int) bool {
		var less bool
		switch sortBy {
		case "speed":
			less = filtered[i].AvgUploadSpeedBps < filtered[j].AvgUploadSpeedBps
		case "latency":
			less = filtered[i].LatencyMs < filtered[j].LatencyMs
		case "duration":
			less = filtered[i].DurationSeconds < filtered[j].DurationSeconds
		case "date":
			fallthrough
		default:
			less = filtered[i].Timestamp.Before(filtered[j].Timestamp)
		}

		if sortDesc {
			return !less
		}
		return less
	})

	return filtered
}

// DeleteRecord removes a record by ID.
func (m *Manager) DeleteRecord(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	idx := -1
	for i, r := range m.records {
		if r.ID == id {
			idx = i
			break
		}
	}

	if idx == -1 {
		return fmt.Errorf("record with ID %s not found", id)
	}

	m.records = append(m.records[:idx], m.records[idx+1:]...)
	return m.saveAtomicUnlocked()
}

// ClearAll removes all history records after user confirmation.
func (m *Manager) ClearAll() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.records = make([]Record, 0)
	return m.saveAtomicUnlocked()
}

// pruneUnlocked applies max records and retention days.
func (m *Manager) pruneUnlocked(s settings.HistorySettings) {
	if s.RetentionDays > 0 {
		cutoff := time.Now().AddDate(0, 0, -s.RetentionDays)
		var kept []Record
		for _, r := range m.records {
			if r.Timestamp.After(cutoff) {
				kept = append(kept, r)
			}
		}
		m.records = kept
	}

	if s.MaxRecords > 0 && len(m.records) > s.MaxRecords {
		m.records = m.records[:s.MaxRecords]
	}
}

func (m *Manager) load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, err := os.Stat(m.filePath); os.IsNotExist(err) {
		return nil
	}

	data, err := os.ReadFile(m.filePath)
	if err != nil {
		return err
	}

	var recs []Record
	if err := json.Unmarshal(data, &recs); err != nil {
		return err
	}

	m.records = recs
	return nil
}

func (m *Manager) saveAtomicUnlocked() error {
	data, err := json.MarshalIndent(m.records, "", "  ")
	if err != nil {
		return err
	}

	if err := os.MkdirAll(m.dataDir, 0700); err != nil {
		return err
	}

	tmpFile := fmt.Sprintf("%s.tmp.%d", m.filePath, os.Getpid())
	f, err := os.OpenFile(tmpFile, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return err
	}

	if _, err := f.Write(data); err != nil {
		_ = f.Close()
		_ = os.Remove(tmpFile)
		return err
	}

	if err := f.Sync(); err != nil {
		_ = f.Close()
		_ = os.Remove(tmpFile)
		return err
	}

	if err := f.Close(); err != nil {
		_ = os.Remove(tmpFile)
		return err
	}

	if err := os.Rename(tmpFile, m.filePath); err != nil {
		_ = os.Remove(tmpFile)
		return err
	}

	return nil
}
