package settings

import (
	"fmt"
	"net"
	"net/url"
	"strings"
)

// NormalizeProxyURL validates and normalizes proxy strings for HTTP, HTTPS, and SOCKS5 (including V2Ray).
// Accepts formats like:
// - "127.0.0.1:10808" (auto-defaults to socks5://127.0.0.1:10808 for V2Ray)
// - "socks5://127.0.0.1:10808"
// - "socks5h://127.0.0.1:10808"
// - "http://127.0.0.1:10809"
// - "socks5://user:pass@127.0.0.1:10808"
func NormalizeProxyURL(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", nil
	}

	// If no scheme was provided (e.g. "127.0.0.1:10808" or "localhost:1080"), default to socks5://
	if !strings.Contains(trimmed, "://") {
		trimmed = "socks5://" + trimmed
	}

	parsed, err := url.Parse(trimmed)
	if err != nil {
		return "", fmt.Errorf("malformed proxy URL: %w", err)
	}

	scheme := strings.ToLower(parsed.Scheme)
	switch scheme {
	case "socks5", "socks5h", "socks", "http", "https":
		// Supported protocols
	default:
		return "", fmt.Errorf("unsupported proxy protocol %q: must be socks5://, socks5h://, http://, or https://", scheme)
	}

	host := parsed.Hostname()
	if host == "" {
		return "", fmt.Errorf("proxy URL must specify a valid host or IP address")
	}

	port := parsed.Port()
	if port == "" {
		// Provide default ports if omitted
		if scheme == "http" {
			parsed.Host = net.JoinHostPort(host, "80")
		} else if scheme == "https" {
			parsed.Host = net.JoinHostPort(host, "443")
		} else {
			// SOCKS5 default for V2Ray / Shadowsocks
			parsed.Host = net.JoinHostPort(host, "10808")
		}
	}

	return parsed.String(), nil
}
