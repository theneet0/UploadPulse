package localization

import "testing"

func TestLocalizationDictionaries(t *testing.T) {
	en := GetLocale("en")
	if en.Direction != "ltr" {
		t.Errorf("expected English direction ltr, got %s", en.Direction)
	}

	fa := GetLocale("fa")
	if fa.Direction != "rtl" {
		t.Errorf("expected Persian direction rtl, got %s", fa.Direction)
	}

	requiredKeys := []string{
		"app_title",
		"start_test",
		"stop_test",
		"meter_current",
		"meter_peak",
		"meter_confirmed_data",
		"privacy_title",
	}

	for _, k := range requiredKeys {
		if en.Strings[k] == "" {
			t.Errorf("missing English translation for %s", k)
		}
		if fa.Strings[k] == "" {
			t.Errorf("missing Persian translation for %s", k)
		}
	}
}
