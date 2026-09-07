package export

import (
	"fmt"
	"math"
)

// ConvertSpeed converts raw bits per second (bps) into the target unit value.
func ConvertSpeed(bps float64, unit string) float64 {
	if bps <= 0 || math.IsNaN(bps) || math.IsInf(bps, 0) {
		return 0
	}
	switch unit {
	case "MB/s":
		// Bytes per second / 10^6
		return (bps / 8.0) / 1000000.0
	case "Kbps":
		// Kilobits per second (10^3)
		return bps / 1000.0
	case "MiB/s":
		// Binary mebibytes per second (2^20)
		return (bps / 8.0) / (1024.0 * 1024.0)
	case "Mbps":
		fallthrough
	default:
		// Megabits per second (10^6)
		return bps / 1000000.0
	}
}

// FormatSpeed formats a bps value into a string with the given unit and decimal precision.
func FormatSpeed(bps float64, unit string, precision int) string {
	if precision < 0 {
		precision = 0
	} else if precision > 3 {
		precision = 3
	}
	val := ConvertSpeed(bps, unit)
	formatStr := fmt.Sprintf("%%.%df %%s", precision)
	return fmt.Sprintf(formatStr, val, unit)
}

// FormatTransferredBytes formats raw byte volume into a clean human-readable representation.
func FormatTransferredBytes(bytes int64) string {
	if bytes <= 0 {
		return "0 B"
	}
	const unit = 1000.0
	if bytes < int64(unit) {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / int64(unit); n >= int64(unit); n /= int64(unit) {
		div *= int64(unit)
		exp++
	}
	prefixes := []string{"KB", "MB", "GB", "TB"}
	if exp >= len(prefixes) {
		exp = len(prefixes) - 1
	}
	return fmt.Sprintf("%.2f %s", float64(bytes)/float64(div), prefixes[exp])
}
