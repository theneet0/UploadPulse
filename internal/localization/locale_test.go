package localization

import "testing"

func TestLocalizationDictionaries(t *testing.T) {
	en := GetLocale("en")
	if en.Direction != "ltr" {
		t.Errorf("expected English direction ltr, got %s", en.Direction)
	}

	requiredKeys := []string{
		"app_title",
		"start_test",
		"stop_test",
		"mode_both",
		"mode_download",
		"mode_upload",
		"meter_current",
		"meter_peak",
		"meter_confirmed_data",
		"privacy_title",
	}

	for _, k := range requiredKeys {
		if en.Strings[k] == "" {
			t.Errorf("missing English translation for %s", k)
		}
	}
}
