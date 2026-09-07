package guard

import (
	"testing"

	"github.com/uploadpulse/uploadpulse/internal/settings"
)

// TestModeSupport verifies that all required test modes ("upload", "download", "both") are valid.
func TestModeSupport(t *testing.T) {
	modes := []string{"upload", "download", "both"}
	for _, m := range modes {
		s := settings.DefaultSettings()
		s.Network.TestMode = m
		validated, err := settings.ValidateSettings(s)
		if err != nil {
			t.Fatalf("validation failed for mode %s: %v", m, err)
		}
		if validated.Network.TestMode != m {
			t.Fatalf("expected test mode %s, got %s", m, validated.Network.TestMode)
		}
	}
}
