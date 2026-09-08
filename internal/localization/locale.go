package localization

// LocaleData contains translated strings for a supported language.
type LocaleData struct {
	LanguageCode string            `json:"languageCode"` // "en"
	Direction    string            `json:"direction"`    // "ltr"
	Strings      map[string]string `json:"strings"`
}

var English = LocaleData{
	LanguageCode: "en",
	Direction:    "ltr",
	Strings: map[string]string{
		"app_title":                 "UploadPulse",
		"nav_test":                  "Upload Test",
		"nav_servers":               "Servers",
		"nav_history":               "History",
		"nav_settings":              "Settings",
		"nav_privacy":               "Privacy",
		"start_test":                "Start Upload Test",
		"stop_test":                 "Stop Test",
		"state_idle":                "Ready to test",
		"state_discovering":         "Discovering servers...",
		"state_measuring_latency":   "Measuring latency...",
		"state_uploading":           "Uploading...",
		"state_completed":           "Upload completed",
		"state_cancelled":           "Test cancelled",
		"state_failed":              "Test failed",
		"meter_current":             "Current Speed",
		"meter_peak":                "Peak Speed",
		"meter_average":             "Average Speed",
		"meter_latency":             "Latency",
		"meter_confirmed_data":      "Server-confirmed data",
		"meter_transmitted_data":    "Transmitted Volume",
		"meter_workers":             "Active Connections",
		"server_auto":               "Automatic Server Selection",
		"server_manual":             "Manual Selection",
		"server_custom":             "Custom Server URL",
		"server_search_placeholder": "Search servers by city, sponsor, or ID...",
		"server_custom_placeholder": "https://custom-server.com/speedtest/upload.php",
		"copy_result":               "Copy Result",
		"copy_with_server":          "Copy with Server Details",
		"copied_toast":              "Result copied to clipboard",
		"repeat_test":               "Repeat Test",
		"delete_record":             "Delete Record",
		"clear_history":             "Clear All History",
		"clear_confirm_title":       "Clear Test History",
		"clear_confirm_msg":         "Are you sure you want to permanently delete all recorded test history? This action cannot be undone.",
		"export_csv":                "Export CSV",
		"export_json":               "Export JSON",
		"history_empty":             "No speed tests recorded yet.",
		"mode_both":                 "Download & Upload",
		"mode_download":             "Download",
		"mode_upload":               "Upload",
		"settings_network":          "Network Configuration",
		"settings_duration":         "Test Duration (seconds)",
		"settings_workers":          "Concurrent Upload Workers",
		"settings_workers_auto":     "Auto (Default 8)",
		"settings_protocol":         "Test Protocol",
		"settings_latency_mode":     "Latency Mode",
		"settings_saving_mode":      "Saving Mode (reduces bandwidth)",
		"settings_proxy":            "Proxy URL (http/https/socks5)",
		"settings_source_ip":        "Source IP (local interface IPv4/IPv6)",
		"settings_display":          "Display Preferences",
		"settings_speed_unit":       "Speed Unit",
		"settings_precision":        "Decimal Precision",
		"settings_theme":            "Theme",
		"settings_mica":             "Enable Windows 11 Mica Backdrop",
		"settings_reduced_motion":   "Reduced Motion",
		"settings_chart":            "Show Live Upload Chart",
		"settings_privacy_mask":     "Mask IP and Sensitive Information",
		"settings_language":         "Language",
		"privacy_title":             "Privacy & Traffic Notice",
		"privacy_body_1":            "UploadPulse measures internet upload speed exclusively. It never performs a download test during startup, server discovery, server selection, diagnostics, or active measurement.",
		"privacy_body_2":            "An upload speed test transmits randomly generated binary data to the designated test server to saturate your upstream pipe. This consumes actual upload network quota.",
		"privacy_body_3":            "UploadPulse contains zero telemetry, zero analytics, zero advertisements, and no cloud accounts. All settings and history remain strictly on your device in %LOCALAPPDATA%\\UploadPulse.",
		"unavailable":               "Unavailable",
		"save_settings":             "Save Settings",
		"settings_saved":            "Settings saved successfully",
	},
}

// GetLocale returns the English LocaleData.
func GetLocale(_ string) LocaleData {
	return English
}
