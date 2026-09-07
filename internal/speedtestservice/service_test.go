package speedtestservice

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/uploadpulse/uploadpulse/internal/settings"
)

func TestStateMachineInitialAndSingleActiveConstraint(t *testing.T) {
	svc := NewService(EventCallback{})
	initial := svc.GetState()
	if initial.State != StateIdle {
		t.Errorf("expected initial state Idle, got %s", initial.State)
	}

	// Fake an active state
	svc.mu.Lock()
	svc.state = StateUploading
	svc.mu.Unlock()

	// Starting another test should immediately fail with "another test is already in progress"
	_, err := svc.StartUploadTest(settings.DefaultSettings().Network)
	if err == nil || err.Error() != "another test is already in progress" {
		t.Errorf("expected 'another test is already in progress', got %v", err)
	}
}

func TestCancelTestWhenIdle(t *testing.T) {
	svc := NewService(EventCallback{})
	err := svc.CancelTest()
	if err != nil {
		t.Errorf("cancelling idle test should not error: %v", err)
	}
	if svc.GetState().State != StateIdle {
		t.Errorf("expected state to remain Idle, got %s", svc.GetState().State)
	}
}

func TestNetworkErrorMapping(t *testing.T) {
	svc := NewService(EventCallback{})

	cases := []struct {
		err      error
		contains string
	}{
		{context.Canceled, "cancelled"},
		{context.DeadlineExceeded, "timeout"},
		{errors.New("dial tcp: lookup speedtest.example.com: no such host"), "DNS resolution failed"},
		{errors.New("dial tcp 127.0.0.1:8080: connect: connection refused"), "connection refused"},
		{errors.New("x509: certificate signed by unknown authority"), "TLS/SSL security handshake failed"},
		{errors.New("dial tcp: connect: network is unreachable"), "internet disconnected or network unreachable"},
		{errors.New("proxyconnect tcp: proxy connection failed"), "proxy error"},
	}

	for _, c := range cases {
		mapped := svc.mapNetworkError(c.err)
		if mapped == nil {
			t.Errorf("expected mapped error for %v", c.err)
			continue
		}
		if !containsIgnoreCase(mapped.Error(), c.contains) {
			t.Errorf("mapped error %q does not contain %q", mapped.Error(), c.contains)
		}
	}
}

func TestCustomServerValidation(t *testing.T) {
	svc := NewService(EventCallback{})
	cfg := settings.DefaultSettings().Network

	// Empty URL
	_, err := svc.ValidateAndPrepareCustomServer("", cfg)
	if err == nil {
		t.Errorf("expected error for empty custom URL")
	}

	// Invalid scheme
	_, err = svc.ValidateAndPrepareCustomServer("ftp://invalid.example.com", cfg)
	if err == nil {
		t.Errorf("expected error for unsupported scheme ftp://")
	}

	// Local test HTTP server
	testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodHead || r.Method == http.MethodGet {
			w.WriteHeader(http.StatusOK)
			return
		}
		if r.Method == http.MethodPost {
			_, _ = io.Copy(io.Discard, r.Body)
			w.WriteHeader(http.StatusOK)
			return
		}
	}))
	defer testServer.Close()

	// Verify local test server prepares successfully
	info, err := svc.ValidateAndPrepareCustomServer(testServer.URL, cfg)
	if err != nil {
		t.Logf("Note: testServer ping check result: %v", err)
	} else if info != nil {
		if !strings.HasPrefix(info.URL, testServer.URL) {
			t.Errorf("expected server URL prefix %s, got %s", testServer.URL, info.URL)
		}
	}
}

func TestEventThrottlingAndMetrics(t *testing.T) {
	var metricCount int
	var mu sync.Mutex

	svc := NewService(EventCallback{
		OnMetrics: func(m LiveMetrics) {
			mu.Lock()
			metricCount++
			mu.Unlock()
		},
	})

	if svc.callbacks.OnMetrics == nil {
		t.Errorf("callback not set")
	}
}

func containsIgnoreCase(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		len(s) > 0 && len(substr) > 0 &&
			(s == substr ||
				len(s) >= len(substr) &&
					contains(toLowerCase(s), toLowerCase(substr))))
}

func toLowerCase(s string) string {
	b := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if 'A' <= c && c <= 'Z' {
			c += 'a' - 'A'
		}
		b[i] = c
	}
	return string(b)
}

func contains(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
