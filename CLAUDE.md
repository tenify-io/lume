# Lume

Kubernetes dashboard desktop app by [Tenify](https://github.com/tenify-io). Wails v2 — Go backend + React/TypeScript frontend.

## Frontend

- **Framework**: React 18 + TypeScript, bundled with Vite 7
- **Styling**: TailwindCSS v4 via `@tailwindcss/vite` plugin (no separate postcss or tailwind config files)
- **Component library**: [shadcn/ui](https://ui.shadcn.com) for reusable UI primitives — always prefer shadcn components over custom implementations
  - Add components: `npm exec -- shadcn@latest add <component>`
  - Components live in `frontend/src/components/ui/`
  - Config: `frontend/components.json`
- **Theme**: Dark mode only (`<html class="dark">`), zinc-based color palette
  - Background: `zinc-950`, surfaces: `zinc-900`
  - Use shadcn CSS variables (`--background`, `--foreground`, etc.) for theme-aware colors in components
  - Accent: `blue-400` / `blue-600`
- **Design principles**:
  - **Near-square corners**: `--radius` is set to `0.2rem` — all radii should stay very small
  - **No borders on filled elements**: If an element has a background color, do not add a border. Use background contrast alone for visual separation. Borders are only for elements with no background fill (e.g., outline-style buttons, table row separators). Use `ring-*` for focus/active highlights on filled elements.
- **Path aliases**: `@/*` maps to `frontend/src/*`
- **Fonts**: Geist Variable (installed via `@fontsource-variable/geist`)

## Backend File Organization

The `pkg/kube/` package organizes code **per-resource**:
- `client.go` — Client struct, Connect, GetContexts, GetCurrentContext, GetNamespaces (core/shared)
- `client_<resource>.go` — List, Detail, and Events methods for a specific resource (e.g., `client_pods.go`, `client_nodes.go`)
- `types.go` — Shared types (Context, EventInfo)
- `types_<resource>.go` — Info, Detail, and supporting types for a specific resource
- `convert.go` — Shared conversion helpers (FormatDuration)
- `convert_<resource>.go` — K8s native type → app type converters for a specific resource
- `watcher.go` — Watcher struct and generic registration mechanism

When adding a new resource, create `client_<resource>.go`, `types_<resource>.go`, and `convert_<resource>.go` rather than appending to existing files.

## Frontend Types

Always import types from the Wails-generated `wailsjs/go/models.ts` (e.g., `kube.PodInfo`, `kube.NodeInfo`). Do **not** re-declare interfaces locally in components — this causes type drift when Go types change.

## Preferences

- JSON file at `~/.config/lume/preferences.json` (via `os.UserConfigDir()`)
- No external dependencies — stdlib `encoding/json` only
- Thread-safe via `sync.RWMutex`, persists to disk on every write
- Backend: `preferences.go` exposes `Get`, `Set`, `Delete`, `All`
- Wails bindings on `App`: `GetPreference(key)`, `SetPreference(key, value)`, `DeletePreference(key)`, `GetAllPreferences()`
- Frontend calls these via the auto-generated `wailsjs/go/main/App` bindings

## Linting

All code must pass linters before merge. CI enforces this.

### Backend (Go)
- **Tool**: [golangci-lint](https://golangci-lint.run/) configured in `.golangci.yml`
- **Run**: `golangci-lint run` (from project root)
- **Enabled linters**: errcheck, govet, staticcheck, unused, gosimple, ineffassign, gocritic, revive, misspell, unconvert, unparam, gofmt

### Frontend (TypeScript)
- **Tool**: ESLint 9 with flat config in `frontend/eslint.config.js`
- **Run**: `cd frontend && npm run lint` (or `npm run lint:fix` to auto-fix)
- **Rules**: typescript-eslint recommended + react-hooks rules
- **Ignored**: `dist/`, `wailsjs/`, `src/components/ui/` (shadcn generated code)

## Testing

All functionality must have thorough test coverage. CI enforces this.

### Backend (Go)
- **Framework**: Go standard `testing` package
- **Run**: `go test -v -race ./...` (from project root)
- **Convention**: Test files are `*_test.go` alongside the code they test

### Frontend (TypeScript)
- **Framework**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Run**: `cd frontend && npm test` (or `npm run test:watch` for dev)
- **Convention**: Test files in `src/test/` or co-located as `*.test.tsx`
- **Setup**: `src/test/setup.ts` configures jest-dom matchers and cleanup
- **Mocking Wails**: Mock `wailsjs/go/main/App` bindings with `vi.mock()` in tests

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs on push/PR to `main`:
- **backend-lint**: `golangci-lint run`
- **backend-test**: `go test -v -race ./...`
- **frontend-lint**: `npm run lint`
- **frontend-test**: `npm test`

## Development

- **Dev mode**: `wails dev` (from project root) — watches for changes and hot-reloads both Go and frontend
- Frontend only: `cd frontend && npm run dev`
- Frontend build: `cd frontend && npm run build`
- Production build: `wails build` (from project root)
