# UploadPulse

> **UploadPulse** is a production-grade desktop application engineered exclusively for **64-bit Windows 11** to measure pure internet upload speed.

![Platform](https://img.shields.io/badge/Platform-Windows%2011%20x64-0078d4)
![Architecture](https://img.shields.io/badge/Architecture-Wails%20v2%20%7C%20Go%20%7C%20Vanilla%20TS-6366f1)
![Strict Policy](https://img.shields.io/badge/Policy-Pure%20Upload%20%28No%20Download%29-10b981)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Key Guarantees & Features

### 1. Pure Upload Measurement (Strict No-Download Guarantee)
UploadPulse is built with an absolute single-purpose architecture: **it measures internet upload speed exclusively**. It never performs a download-speed test—not during startup, server discovery, server selection, diagnostics, or active measurement. Verified by automated Abstract Syntax Tree (AST) guard tests (`internal/guard/guard_test.go`), zero download testing functions exist or are invoked anywhere in the codebase.

### 2. Windows 11 Fluent Design & Mica Backing
- Tailored for Windows 11 desktop aesthetic with Segoe UI Variable typography, soft translucent depth, and subtle electric blue / blue-violet accents (`#0078d4`, `#6366f1`).
- Central, distraction-free circular upload gauge showing instantaneous speed, peak speed, average speed, latency, server-confirmed data volume, and live connection workers.
- Real-time Canvas-based upload throughput chart with smooth quadratic curves and adaptive device pixel ratio.
- Respects system reduced-motion settings.

### 3. Comprehensive Localization: English (LTR) & Persian (RTL)
- Complete two-way localization for English and Persian (فارسی).
- Full Right-to-Left (RTL) layout support in Persian mode with Vazirmatn typography, natural control alignments, and high-legibility numerals.

### 4. Precision Network Engine & Tunable Settings
- Built on a hardened, context-aware fork of `speedtest-go`.
- Configurable test duration: presets of 5s, 10s, 15s, 30s, 60s, or safely clamped custom durations.
- Worker concurrency tuning: 1 (Saving Mode) to 24 connections.
- Protocol selection: standard HTTP/HTTPS or raw TCP mode.
- Server selection: Automatic nearest optimal server, searchable public server directory with live latency checks, or custom enterprise server URL validation.
- Proxy support: HTTP, HTTPS, and SOCKS5.
- Local interface source IP binding for Windows multi-NIC routing.

### 5. Local Data Storage & Privacy Protection
- **Zero Telemetry**: No tracking, no background analytics, no ads, and no cloud accounts.
- Persistent configuration and test history stored locally in `%LOCALAPPDATA%\UploadPulse`.
- Export capabilities to formula-injection-safe CSV and formatted JSON.
- Privacy masking option for IP addresses in exports and clipboard summaries.

---

## Project Architecture

```
uploadpulse/
├── app.go                      # Wails v2 backend bridge & desktop RPC bindings
├── main.go                     # Desktop application entrypoint & window configuration
├── go.mod                      # Go module definitions
├── internal/
│   ├── export/                 # CSV (with DDE sanitization), JSON, and summary generators
│   ├── guard/                  # AST parser verifying zero download calls
│   ├── history/                # Test history persistence and atomic file storage
│   ├── localization/           # English (LTR) and Persian (RTL) dictionaries
│   ├── platform/windows/       # Canonical Windows AppData path resolution
│   ├── settings/               # AppSettings model, validation, and recovery
│   └── speedtestservice/       # Upload-only speedtest controller & lifecycle state machine
├── src/                        # Vanilla TypeScript frontend (No React, No Electron)
│   ├── bridge.ts               # Wails RPC connector & preview fallback
│   ├── chart.ts                # Real-time HTML5 canvas telemetry chart
│   ├── index.css               # Fluent Design styles & animations
│   ├── main.ts                 # Frontend bootstrap entrypoint
│   ├── types.ts                # Shared TypeScript contracts
│   └── ui.ts                   # Modular UI layout & view controller
└── .github/workflows/          # Automated GitHub Actions CI/CD workflows
```

---

## Building from Source

### Prerequisites
- Go 1.22 or higher
- Node.js 18+ & npm
- [Wails CLI v2](https://wails.io/): `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- 64-bit Windows 11 (or cross-compiling environment)

### Development Mode
To run in live development mode with Vite asset server:
```bash
npm install
wails dev
```

### Production Build
To compile the standalone Windows 11 `.exe` binary:
```bash
# 1. Build frontend assets
npm run build

# 2. Build desktop executable
go build -o uploadpulse.exe .

# Or using Wails CLI:
wails build -platform windows/amd64
```

### Running Test Suite
Execute all unit tests and AST architecture guards:
```bash
go test -v ./...
```

---

## License

UploadPulse is licensed under the [MIT License](LICENSE).
Third-party component licenses are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
