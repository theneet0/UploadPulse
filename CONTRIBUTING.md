# Contributing to UploadPulse

Thank you for your interest in contributing to UploadPulse!

## Strict Architectural Guardrail: Zero Download Testing

UploadPulse is explicitly and intentionally designed to **measure internet upload speed exclusively**.

> **CRITICAL RULE**: No download-speed test may ever be introduced into this project.
> Any Pull Request or code modification that initiates, simulates, or schedules a download-speed test will be rejected immediately.

The codebase includes an automated Abstract Syntax Tree (AST) guard (`internal/guard/guard_test.go`) that validates every Go file on CI.

## Development Workflow

1. Fork and clone the repository.
2. Ensure you have Go 1.22+ and Node.js 18+ installed.
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Run tests:
   ```bash
   go test -v ./...
   ```
5. Build the frontend and desktop binary:
   ```bash
   npm run build
   go build -v -o uploadpulse.exe .
   ```

## Code Guidelines

- **Backend**: Standard Go conventions (`gofmt`, explicit error checks, context cancellation propagation, thread safety with `sync.RWMutex`).
- **Frontend**: Vanilla TypeScript, HTML, CSS with Tailwind. No React or Electron.
- **Design**: Windows 11 Fluent Design principles with electric blue/indigo accents, Mica backdrops, and Segoe UI Variable / Vazirmatn typography.
- **Localization**: All user-facing strings must have entries in both `English` and `Persian` dictionaries in `internal/localization/locale.go` and `src/bridge.ts`.
