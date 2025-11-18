# CursorFi Visual Site Editor

A visual site editor that runs in a web browser, providing a Figma/Webflow-style interface for building pages. The system maintains perfect bidirectional synchronization between the visual canvas and local project files, enabling developers to edit visually while maintaining clean, editable code.

## Features

- 🎨 **Visual drag-and-drop editor** with 40+ pre-built components
- 🔄 **Real-time two-way sync** between canvas and code files
- 🚀 **Multi-framework support** (Next.js, Vite, Astro)
- 💻 **Cursor IDE integration** (cursor:// and cursorfi:// protocols)
- 🛡️ **Code preservation** (never breaks existing code)
- 🔍 **Component auto-discovery** from project files

## Prerequisites

- Docker and docker-compose installed on the remote server
- A project directory on the remote server (Next.js, Vite, or Astro project)
- Network access to the remote server from your local machine
- Cursor IDE installed on your local machine (for integration features)

## Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Project path (absolute path on remote server)
CURSORFI_PROJECT_PATH=/path/to/your/project

# Ports (non-standard ports)
CURSORFI_FRONTEND_PORT=3001
CURSORFI_BACKEND_PORT=3002

# Sync configuration
CURSORFI_SYNC_DEBOUNCE_MS=400

# Logging
CURSORFI_LOG_LEVEL=info
CURSORFI_TRACE_ENABLED=true
```

### 2. Build and Start Services

```bash
docker-compose up --build
```

This will:
- Build frontend and backend containers
- Start all services
- Mount your project directory into the backend container

### 3. Access the Editor

Open your browser and navigate to:

```
http://your-remote-server:3001
```

The editor should load and automatically scan your project for components and pages.

## Project Structure

```
cursorfi/
├── frontend/          # React 19 + Vite 6 + craft.js frontend
├── backend/           # Elysia + tRPC backend
├── test/              # Playwright E2E tests
├── docker-compose.yml # Container orchestration
├── .env.example       # Environment variable template
└── README.md          # This file
```

## Development

### Running Tests

All tests run in Docker containers:

```bash
# Unit and integration tests
docker-compose run --rm backend bun test

# E2E tests
docker-compose run --rm test bun test
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CURSORFI_PROJECT_PATH` | Absolute path to project directory | Required |
| `CURSORFI_FRONTEND_PORT` | Frontend web server port | `3001` |
| `CURSORFI_BACKEND_PORT` | Backend API server port | `3002` |
| `CURSORFI_SYNC_DEBOUNCE_MS` | Debounce delay for file writes | `400` |
| `CURSORFI_FILE_WATCH_INTERVAL` | File watching poll interval | Auto |
| `CURSORFI_LOG_LEVEL` | Logging level (info, warn, error) | `info` |
| `CURSORFI_TRACE_ENABLED` | Enable request tracing | `true` |

## Cursor IDE Integration

Cursor IDE automatically forwards ports from the remote server to your local Windows machine:
- Backend port `3002` → accessible as `localhost:3002` on Windows
- Frontend port `3001` → accessible as `localhost:3001` on Windows

Protocol handlers (`cursor://` and `cursorfi://`) use the forwarded ports to communicate with the backend.

For more details, see the [Quick Start Guide](specs/001-cursorfi-editor/quickstart.md).

## Documentation

- [Feature Specification](specs/001-cursorfi-editor/spec.md)
- [Implementation Plan](specs/001-cursorfi-editor/plan.md)
- [Quick Start Guide](specs/001-cursorfi-editor/quickstart.md)
- [Data Model](specs/001-cursorfi-editor/data-model.md)
- [Research & Technical Decisions](specs/001-cursorfi-editor/research.md)

## License

[License information to be added]

