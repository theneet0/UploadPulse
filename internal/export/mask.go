package export

import (
	"fmt"
	"net"
	"strings"
)

// MaskIP masks the host portions of an IPv4 or IPv6 address for privacy preservation.
func MaskIP(ipStr string) string {
	trimmed := strings.TrimSpace(ipStr)
	if trimmed == "" {
		return "Unavailable"
	}

	ip := net.ParseIP(trimmed)
	if ip == nil {
		return "[Masked]"
	}

	if ipv4 := ip.To4(); ipv4 != nil {
		// e.g. 192.168.1.100 -> 192.168.*.*
		return fmt.Sprintf("%d.%d.*.*", ipv4[0], ipv4[1])
	}

	// IPv6: mask the interface ID
	return strings.Split(trimmed, ":")[0] + "::[Masked]"
}

// SanitizeCSVFormula protects against CSV Spreadsheet Formula Injection (CWE-1236).
// If a cell begins with =, +, -, @, tab, or carriage return, it prefixes it with a single quote.
func SanitizeCSVFormula(val string) string {
	if val == "" {
		return ""
	}
	first := val[0]
	if first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r' {
		return "'" + val
	}
	return val
}
