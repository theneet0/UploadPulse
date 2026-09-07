package export

import (
	"encoding/json"

	"github.com/uploadpulse/uploadpulse/internal/history"
)

// GenerateJSON serializes history records into a clean, pretty-printed JSON string.
func GenerateJSON(records []history.Record, maskSensitive bool) (string, error) {
	sanitized := make([]history.Record, len(records))
	copy(sanitized, records)

	if maskSensitive {
		for i := range sanitized {
			sanitized[i].ClientIP = MaskIP(sanitized[i].ClientIP)
		}
	}

	data, err := json.MarshalIndent(sanitized, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}
