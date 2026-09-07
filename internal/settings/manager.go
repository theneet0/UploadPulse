package settings

import (
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/uploadpulse/uploadpulse/internal/platform/windows"
)

// Manager manages loading, validating, and atomically persisting AppSettings.
type Manager struct {
	mu           sync.RWMutex
	filePath     string
	current      AppSettings
	dataDir      string
}

// NewManager creates and initializes a Settings Manager.
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
		filePath = filepath.Join(dataDir, "settings.json")
	}

	m := &Manager{
		filePath: filePath,
		dataDir:  dataDir,
		current:  DefaultSettings(),
	}

	if err := m.load(); err != nil {
		// Log or handle load error; defaults already in m.current
	}

	return m, nil
}

// Get returns a thread-safe copy of current settings.
func (m *Manager) Get() AppSettings {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.current
}

// Update validates and atomically saves new settings.
func (m *Manager) Update(newSettings AppSettings) error {
	validated, err := ValidateSettings(newSettings)
	if err != nil {
		return fmt.Errorf("invalid settings: %w", err)
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	m.current = validated
	return m.saveAtomic(validated)
}

// ValidateSettings validates and sanitizes all configuration fields.
func ValidateSettings(s AppSettings) (AppSettings, error) {
	// Duration: 1 to 300 seconds
	if s.Network.DurationSeconds < 1 {
		s.Network.DurationSeconds = 1
	} else if s.Network.DurationSeconds > 300 {
		s.Network.DurationSeconds = 300
	}

	// Workers: 0 (Auto) to 32
	if s.Network.WorkerCount < 0 {
		s.Network.WorkerCount = 0
	} else if s.Network.WorkerCount > 32 {
		s.Network.WorkerCount = 32
	}

	// Protocol: "http" or "tcp"
	s.Network.Protocol = strings.ToLower(strings.TrimSpace(s.Network.Protocol))
	if s.Network.Protocol != "tcp" {
		s.Network.Protocol = "http"
	}

	// Latency mode: "http", "tcp", "icmp"
	s.Network.LatencyMode = strings.ToLower(strings.TrimSpace(s.Network.LatencyMode))
	if s.Network.LatencyMode != "tcp" && s.Network.LatencyMode != "icmp" {
		s.Network.LatencyMode = "http"
	}

	// Proxy validation
	if s.Network.ProxyURL != "" {
		parsed, err := url.Parse(strings.TrimSpace(s.Network.ProxyURL))
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https" && parsed.Scheme != "socks5") {
			return s, fmt.Errorf("proxy URL must use http, https, or socks5 scheme")
		}
		s.Network.ProxyURL = parsed.String()
	}

	// Source IP validation: on Windows, must be a valid IPv4 or IPv6
	if s.Network.SourceIP != "" {
		ip := net.ParseIP(strings.TrimSpace(s.Network.SourceIP))
		if ip == nil {
			return s, fmt.Errorf("source IP must be a valid IPv4 or IPv6 address (network interface names are not supported on Windows)")
		}
		s.Network.SourceIP = ip.String()
	}

	// Custom server URL validation
	if s.Network.CustomServerURL != "" {
		u, err := url.Parse(strings.TrimSpace(s.Network.CustomServerURL))
		if err != nil || (u.Scheme != "http" && u.Scheme != "https" && u.Scheme != "tcp") {
			return s, fmt.Errorf("custom server URL must begin with http://, https://, or tcp://")
		}
	}

	// Unit validation
	switch s.Display.SpeedUnit {
	case "Mbps", "MB/s", "Kbps", "MiB/s":
		// valid
	default:
		s.Display.SpeedUnit = "Mbps"
	}

	// Decimal precision: 0 to 3
	if s.Display.DecimalPrecision < 0 {
		s.Display.DecimalPrecision = 0
	} else if s.Display.DecimalPrecision > 3 {
		s.Display.DecimalPrecision = 3
	}

	// Theme: system, dark, light
	switch s.Display.Theme {
	case "light", "dark", "system":
		// valid
	default:
		s.Display.Theme = "system"
	}

	// Language: en, fa
	if s.Display.Language != "fa" {
		s.Display.Language = "en"
	}

	// History retention
	if s.History.MaxRecords < 10 {
		s.History.MaxRecords = 10
	} else if s.History.MaxRecords > 1000 {
		s.History.MaxRecords = 1000
	}

	if s.History.RetentionDays < 0 {
		s.History.RetentionDays = 0
	} else if s.History.RetentionDays > 3650 {
		s.History.RetentionDays = 3650
	}

	return s, nil
}

// load reads settings from disk, with fallback and corrupted file recovery.
func (m *Manager) load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, err := os.Stat(m.filePath); os.IsNotExist(err) {
		// File does not exist yet; save defaults atomically
		return m.saveAtomic(m.current)
	}

	data, err := os.ReadFile(m.filePath)
	if err != nil {
		return err
	}

	var loaded AppSettings
	if err := json.Unmarshal(data, &loaded); err != nil {
		// Corrupted settings recovery: preserve bad file for diagnosis and reset to defaults
		corruptPath := m.filePath + ".corrupt"
		_ = os.WriteFile(corruptPath, data, 0600)
		m.current = DefaultSettings()
		_ = m.saveAtomic(m.current)
		return fmt.Errorf("corrupted settings file recovered: %w", err)
	}

	validated, _ := ValidateSettings(loaded)
	m.current = validated
	return nil
}

// saveAtomic writes settings to a temporary file, flushes it, and renames it to the target file.
func (m *Manager) saveAtomic(s AppSettings) error {
	data, err := json.MarshalIndent(s, "", "  ")
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
