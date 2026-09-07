package export

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"time"

	"github.com/uploadpulse/uploadpulse/internal/history"
)

// GenerateCSV converts history records into a clean, formula-injection-safe CSV string.
func GenerateCSV(records []history.Record, maskSensitive bool, speedUnit string, decimalPrecision int) (string, error) {
	buf := new(bytes.Buffer)
	writer := csv.NewWriter(buf)

	// CSV Header
	header := []string{
		"ID",
		"Timestamp (UTC)",
		"Status",
		fmt.Sprintf("Avg Upload Speed (%s)", speedUnit),
		fmt.Sprintf("Peak Upload Speed (%s)", speedUnit),
		fmt.Sprintf("Final Stable Speed (%s)", speedUnit),
		"Duration (s)",
		"Transferred Data",
		"Server-confirmed Data",
		"Confirmation Ratio (%)",
		"Latency (ms)",
		"Server ID",
		"Server Name",
		"Server Sponsor",
		"Server Country",
		"Server City",
		"Distance (km)",
		"Protocol",
		"Client IP",
	}

	for i, h := range header {
		header[i] = SanitizeCSVFormula(h)
	}

	if err := writer.Write(header); err != nil {
		return "", err
	}

	for _, r := range records {
		status := "Success"
		if !r.Success {
			status = "Failed: " + r.ErrorMessage
		}

		clientIP := r.ClientIP
		if maskSensitive {
			clientIP = MaskIP(clientIP)
		}

		row := []string{
			SanitizeCSVFormula(r.ID),
			SanitizeCSVFormula(r.Timestamp.UTC().Format(time.RFC3339)),
			SanitizeCSVFormula(status),
			SanitizeCSVFormula(FormatSpeed(r.AvgUploadSpeedBps, speedUnit, decimalPrecision)),
			SanitizeCSVFormula(FormatSpeed(r.PeakUploadSpeedBps, speedUnit, decimalPrecision)),
			SanitizeCSVFormula(FormatSpeed(r.FinalStableSpeedBps, speedUnit, decimalPrecision)),
			SanitizeCSVFormula(fmt.Sprintf("%.2f", r.DurationSeconds)),
			SanitizeCSVFormula(FormatTransferredBytes(r.TransferredBytes)),
			SanitizeCSVFormula(FormatTransferredBytes(r.ServerConfirmedBytes)),
			SanitizeCSVFormula(fmt.Sprintf("%.1f", r.ServerConfirmedRatio*100)),
			SanitizeCSVFormula(fmt.Sprintf("%d", r.LatencyMs)),
			SanitizeCSVFormula(r.Server.ID),
			SanitizeCSVFormula(r.Server.Name),
			SanitizeCSVFormula(r.Server.Sponsor),
			SanitizeCSVFormula(r.Server.Country),
			SanitizeCSVFormula(r.Server.City),
			SanitizeCSVFormula(fmt.Sprintf("%.1f", r.Server.Distance)),
			SanitizeCSVFormula(r.EffectiveSettings.Protocol),
			SanitizeCSVFormula(clientIP),
		}

		if err := writer.Write(row); err != nil {
			return "", err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return "", err
	}

	return buf.String(), nil
}
