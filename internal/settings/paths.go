package settings

import (
	"os"
	"path/filepath"
	"runtime"
)

// GetAppDataDir returns the canonical path for UploadPulse data storage.
// On Windows: %LOCALAPPDATA%\UploadPulse
// On other operating systems (fallback): ~/.config/uploadpulse or system config dir
func GetAppDataDir() (string, error) {
	var baseDir string
	if runtime.GOOS == "windows" {
		baseDir = os.Getenv("LOCALAPPDATA")
		if baseDir == "" {
			userProfile := os.Getenv("USERPROFILE")
			if userProfile != "" {
				baseDir = filepath.Join(userProfile, "AppData", "Local")
			}
		}
	}

	if baseDir == "" {
		var err error
		baseDir, err = os.UserConfigDir()
		if err != nil {
			baseDir = os.TempDir()
		}
	}

	appDir := filepath.Join(baseDir, "UploadPulse")
	if err := os.MkdirAll(appDir, 0700); err != nil {
		return "", err
	}
	return appDir, nil
}
