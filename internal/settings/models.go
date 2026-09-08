package settings

// NetworkSettings holds all network configuration options.
type NetworkSettings struct {
	TestMode            string  `json:"testMode"`            // "both", "download", "upload"
	DurationSeconds     int     `json:"durationSeconds"`     // 5, 10, 15, 30, 60, or custom (1-300)
	WorkerCount         int     `json:"workerCount"`         // 0 = Auto (up to 8 upload workers by default), 1-32
	Protocol            string  `json:"protocol"`            // "http" or "tcp" (experimental)
	LatencyMode         string  `json:"latencyMode"`         // "http", "tcp", or "icmp"
	JitterSampleCount   int     `json:"jitterSampleCount"`   // 5, 10, 15, 20, 30 ping samples
	IPVersion           string  `json:"ipVersion"`           // "auto", "ipv4", "ipv6"
	WarmupSeconds       int     `json:"warmupSeconds"`       // 0-5s
	SavingMode          bool    `json:"savingMode"`          // limits total transferred bytes
	ProxyURL            string  `json:"proxyURL"`            // http://, https://, socks5://
	SourceIP            string  `json:"sourceIP"`            // valid local IP address for source binding
	CustomDNSServer     string  `json:"customDNSServer"`     // e.g. 1.1.1.1:53 or 8.8.8.8:53
	UserAgent           string  `json:"userAgent"`           // custom client User-Agent
	VirtualCity         string  `json:"virtualCity"`         // virtual location override
	Latitude            float64 `json:"latitude"`            // coordinate override
	Longitude           float64 `json:"longitude"`           // coordinate override
	ServerSearchKeyword string  `json:"serverSearchKeyword"` // keyword to filter servers
	CountryFilter       string  `json:"countryFilter"`       // 2-letter ISO country code (e.g. US, DE, IR)
	CustomServerURL     string  `json:"customServerURL"`     // custom target speedtest server URL
	SelectedServerID    string  `json:"selectedServerID"`    // empty for auto
	ServerSelectionMode string  `json:"serverSelectionMode"` // "auto", "manual", "custom"
}

// DisplaySettings holds all UI, styling, and visual preferences.
type DisplaySettings struct {
	SpeedUnit              string  `json:"speedUnit"`              // "Mbps", "MB/s", "Kbps", "MiB/s", "Gbps"
	DecimalPrecision       int     `json:"decimalPrecision"`       // 0, 1, 2, 3
	Theme                  string  `json:"theme"`                  // "system", "dark", "light", "oled", "cyber"
	AccentColor            string  `json:"accentColor"`            // "#0078d4" (Electric Blue), "#6366f1" (Blue-Violet), etc.
	EnableMica             bool    `json:"enableMica"`             // Windows 11 Mica backdrop effect
	ReducedMotion          bool    `json:"reducedMotion"`          // Respect or enforce reduced animations
	ShowLiveChart          bool    `json:"showLiveChart"`          // Toggle live chart visibility beneath meter
	ChartRetentionPoints   int     `json:"chartRetentionPoints"`   // 20 to 100 data points
	TextScalingPercent     int     `json:"textScalingPercent"`     // 100, 110, 125, 150
	AlwaysOnTop            bool    `json:"alwaysOnTop"`            // Keep window on top
	MinimizeToTray         bool    `json:"minimizeToTray"`         // Minimize to Windows system tray
	CloseAction            string  `json:"closeAction"`            // "exit" or "tray"
	CompletionNotification bool    `json:"completionNotification"` // Show Windows desktop notification
	SoundAlert             bool    `json:"soundAlert"`             // Audio chime upon test completion
	AutoStartOnLaunch      bool    `json:"autoStartOnLaunch"`      // Trigger test automatically when started
	MaskSensitiveData      bool    `json:"maskSensitiveData"`      // Mask IP address and ISP names in results & exports
	Language               string  `json:"language"`               // "en" (English)
}

// HistorySettings holds retention and persistence policies.
type HistorySettings struct {
	MaxRecords    int `json:"maxRecords"`    // Maximum number of stored records (e.g. 100)
	RetentionDays int `json:"retentionDays"` // Days to keep records (0 = indefinitely)
}

// AppSettings represents the full application configuration.
type AppSettings struct {
	Network NetworkSettings `json:"network"`
	Display DisplaySettings `json:"display"`
	History HistorySettings `json:"history"`
}

// DefaultSettings returns safe, production-tuned default values.
func DefaultSettings() AppSettings {
	return AppSettings{
		Network: NetworkSettings{
			TestMode:            "both",
			DurationSeconds:     10,
			WorkerCount:         0, // Auto
			Protocol:            "http",
			LatencyMode:         "http",
			JitterSampleCount:   10,
			IPVersion:           "auto",
			WarmupSeconds:       0,
			SavingMode:          false,
			ProxyURL:            "",
			SourceIP:            "",
			CustomDNSServer:     "",
			UserAgent:           "UploadPulse/2.0.0 (Windows 11 x64)",
			VirtualCity:         "",
			Latitude:            0.0,
			Longitude:           0.0,
			ServerSearchKeyword: "",
			CountryFilter:       "",
			CustomServerURL:     "",
			SelectedServerID:    "",
			ServerSelectionMode: "auto",
		},
		Display: DisplaySettings{
			SpeedUnit:              "Mbps",
			DecimalPrecision:       2,
			Theme:                  "system",
			AccentColor:            "#0078d4", // Electric Blue default
			EnableMica:             true,
			ReducedMotion:          false,
			ShowLiveChart:          true,
			ChartRetentionPoints:   40,
			TextScalingPercent:     100,
			AlwaysOnTop:            false,
			MinimizeToTray:         false,
			CloseAction:            "exit",
			CompletionNotification: true,
			SoundAlert:             true,
			AutoStartOnLaunch:      false,
			MaskSensitiveData:      true,
			Language:               "en",
		},
		History: HistorySettings{
			MaxRecords:    100,
			RetentionDays: 90,
		},
	}
}
