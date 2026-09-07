package export

import (
	"fmt"
	"strings"
	"time"

	"github.com/uploadpulse/uploadpulse/internal/history"
)

// GenerateResultSummary generates a clean, readable text summary for copying to clipboard.
func GenerateResultSummary(rec history.Record, includeServerDetails bool, maskSensitive bool, speedUnit string, decimalPrecision int) string {
	var sb strings.Builder

	sb.WriteString("=== UploadPulse Speed Test ===\n")
	sb.WriteString(fmt.Sprintf("Date & Time: %s\n", rec.Timestamp.Local().Format(time.RFC1123)))

	mode := rec.TestMode
	if mode == "" {
		mode = "upload"
	}
	sb.WriteString(fmt.Sprintf("Test Mode: %s\n", strings.ToUpper(mode)))

	if !rec.Success {
		sb.WriteString(fmt.Sprintf("Status: Failed (%s)\n", rec.ErrorMessage))
		return sb.String()
	}

	if mode == "both" || mode == "download" {
		sb.WriteString(fmt.Sprintf("Average Download: %s\n", FormatSpeed(rec.AvgDownloadSpeedBps, speedUnit, decimalPrecision)))
		sb.WriteString(fmt.Sprintf("Peak Download: %s\n", FormatSpeed(rec.PeakDownloadSpeedBps, speedUnit, decimalPrecision)))
	}

	if mode == "both" || mode == "upload" {
		sb.WriteString(fmt.Sprintf("Average Upload: %s\n", FormatSpeed(rec.AvgUploadSpeedBps, speedUnit, decimalPrecision)))
		sb.WriteString(fmt.Sprintf("Peak Upload: %s\n", FormatSpeed(rec.PeakUploadSpeedBps, speedUnit, decimalPrecision)))

		if rec.FinalStableSpeedBps > 0 {
			sb.WriteString(fmt.Sprintf("Final Stable Speed: %s\n", FormatSpeed(rec.FinalStableSpeedBps, speedUnit, decimalPrecision)))
		} else {
			sb.WriteString("Final Stable Speed: Unavailable\n")
		}
	}

	sb.WriteString(fmt.Sprintf("Latency: %d ms\n", rec.LatencyMs))
	sb.WriteString(fmt.Sprintf("Jitter: %.2f ms\n", rec.JitterMs))
	sb.WriteString(fmt.Sprintf("Test Duration: %.1f seconds\n", rec.DurationSeconds))
	sb.WriteString(fmt.Sprintf("Total Transmitted Data: %s\n", FormatTransferredBytes(rec.TransferredBytes)))

	if rec.ServerConfirmedBytes > 0 {
		sb.WriteString(fmt.Sprintf("Server-confirmed data: %s (%.1f%%)\n",
			FormatTransferredBytes(rec.ServerConfirmedBytes),
			rec.ServerConfirmedRatio*100))
	} else if mode == "upload" || mode == "both" {
		sb.WriteString("Server-confirmed data: Unavailable\n")
	}

	if includeServerDetails {
		sb.WriteString("\n--- Server Details ---\n")
		serverName := rec.Server.Name
		if serverName == "" {
			serverName = "Unavailable"
		}
		sb.WriteString(fmt.Sprintf("Server: %s\n", serverName))

		if rec.Server.Sponsor != "" {
			sb.WriteString(fmt.Sprintf("Sponsor: %s\n", rec.Server.Sponsor))
		}
		if rec.Server.City != "" || rec.Server.Country != "" {
			sb.WriteString(fmt.Sprintf("Location: %s, %s\n", rec.Server.City, rec.Server.Country))
		}
		if rec.Server.Distance > 0 {
			sb.WriteString(fmt.Sprintf("Distance: %.1f km\n", rec.Server.Distance))
		}
		if rec.Server.ID != "" {
			sb.WriteString(fmt.Sprintf("Server ID: %s\n", rec.Server.ID))
		}
	}

	if !maskSensitive && rec.ClientIP != "" {
		sb.WriteString(fmt.Sprintf("Client IP: %s\n", rec.ClientIP))
	}

	return sb.String()
}
