# Lume

Kubernetes dashboard desktop app by [Tenify](https://github.com/tenify-io).

## Development

- [Go 1.25+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation) (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)
- A valid `~/.kube/config` with at least one context configured

Run the app in dev mode with hot-reload for both Go and frontend changes:

```bash
wails dev
```

To work on the frontend only (without the Go backend):

```bash
cd frontend
npm run dev
```

## Building

Build a production binary:

```bash
wails build
```

The output binary will be in `build/bin/`.

## Testing

```bash
# Backend
go test -v -race ./...

# Frontend
cd frontend && npm test
```

## Linting

```bash
# Backend
golangci-lint run

# Frontend
cd frontend && npm run lint
```
