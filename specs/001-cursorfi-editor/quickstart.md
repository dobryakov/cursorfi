# CursorFi Quick Start Guide

This guide will help you get the CursorFi Visual Site Editor up and running on your remote server.

## Prerequisites

- Docker and docker-compose installed on the remote server
- A project directory on the remote server (Next.js, Vite, or Astro project)
- Network access to the remote server from your local machine
- Cursor IDE installed on your local machine (for integration features)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cursorfi
```

### 2. Configure Environment Variables

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

### 3. Build and Start Services

```bash
docker-compose up --build
```

This will:
- Build frontend and backend containers
- Start all services
- Mount your project directory into the backend container

### 4. Access the Editor

Open your browser and navigate to:

```
http://your-remote-server:3001
```

The editor should load and automatically scan your project for components and pages.

## Initial Setup

### First Launch

1. **Project Path Configuration**: On first launch, if `CURSORFI_PROJECT_PATH` is not set, you'll be prompted to provide the project path.

2. **Component Scanning**: The system will automatically scan your project for components. This may take a few seconds for large projects.

3. **Page Discovery**: The system will discover all pages in your project based on the framework:
   - **Next.js**: `app/` directory (App Router) or `pages/` directory (Pages Router)
   - **Vite**: `src/pages/` or `src/routes/`
   - **Astro**: `src/pages/`

### Global Configuration

Create a `cursorfi.json` file in the CursorFi installation directory (not in your project root). This is a global configuration file:

```json
{
  "projectPath": "/path/to/your/project/on/remote/server",
  "framework": "nextjs",
  "frameworkVariant": "app-router",
  "componentPaths": [
    "src/components",
    "app/components"
  ]
}
```

**Note**: The `cursorfi.json` file is global to the CursorFi installation, not per-project. Framework type and component paths are auto-detected if not specified. The project path must point to a directory on the remote server where the editor runs.

## Basic Usage

### Opening a Page

1. Click on a page in the sidebar (or use the page switcher)
2. The canvas will load the page structure
3. You can now edit the page visually

### Adding Components

1. **From Component Library**: Drag a pre-built component from the sidebar onto the canvas
2. **From Your Project**: Drag a custom component from the "Your Components" section

### Editing Elements

1. **Select**: Click on any element on the canvas
2. **Move**: Drag the element to reposition it
3. **Resize**: Use resize handles (for containers)
4. **Style**: Use the properties panel to modify Tailwind classes
5. **Delete**: Press `Delete` key or use the delete button

### Undo/Redo

- **Undo**: `Cmd+Z` (macOS) or `Ctrl+Z` (Windows/Linux)
- **Redo**: `Cmd+Shift+Z` (macOS) or `Ctrl+Shift+Z` (Windows/Linux)

### Opening Code in Cursor IDE

1. Right-click on any element in the canvas
2. Select "Open in Cursor"
3. Cursor IDE will open to the corresponding file and line number

**Note**: For remote deployment, ensure Cursor IDE is connected to the remote server (port forwarding is automatic). Protocol handlers use the forwarded ports to communicate with the backend (see Cursor IDE Integration section).

## File Synchronization

### Visual to Code

- Changes in the visual editor are automatically synced to code files
- Sync is debounced (400ms default) to prevent excessive writes
- You'll see a sync indicator in the status bar

### Code to Visual

- When you modify code files externally, the canvas automatically updates
- File changes are detected within 1 second
- A notification will appear if a conflict is detected (last-write-wins)

## Testing

### Run Tests

All tests run in Docker containers:

```bash
# Unit and integration tests
docker-compose run --rm backend bun test

# E2E tests
docker-compose run --rm test bun test
```

### Test Scenarios

The test suite covers:
- Visual-to-code synchronization
- Code-to-visual synchronization
- Multi-page editing
- Component import
- Cursor IDE integration
- Code preservation
- 20+ positioning scenarios

## Troubleshooting

### Editor Won't Load

1. Check that containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs frontend`
3. Verify port is accessible: `curl http://localhost:3001`

### Components Not Appearing

1. Check component scan logs: `docker-compose logs backend | grep scan`
2. Verify component paths in global `cursorfi.json` (or rely on auto-detection)
3. Ensure components are in supported directories (`src/components`, `app/components`, etc.)

### File Sync Not Working

1. Check file watcher logs: `docker-compose logs backend | grep watcher`
2. Verify project path is correct and accessible
3. Check file permissions on the project directory
4. On Linux, check inotify limits: `cat /proc/sys/fs/inotify/max_user_watches`

### Cursor IDE Integration Not Working

1. Ensure Cursor IDE is connected to the remote server (port forwarding should be active)
2. Verify that ports are forwarded: Check Cursor IDE's port forwarding panel
3. Test backend accessibility: `curl http://localhost:3002/api/trpc/project.get` (should work from Windows machine)
4. Verify protocol handlers are registered (see Cursor IDE Integration section)
5. Check that protocol handler can access `localhost:3002` (forwarded port)

## Cursor IDE Integration

### Port Forwarding (Automatic)

Cursor IDE automatically forwards ports from the remote server to your local Windows machine:
- Backend port `3002` → accessible as `localhost:3002` on Windows
- Frontend port `3001` → accessible as `localhost:3001` on Windows

**No additional setup required** - port forwarding happens automatically when Cursor IDE is connected to the remote server.

### Protocol Handlers

Protocol handlers (`cursor://` and `cursorfi://`) use the forwarded ports to communicate with the backend:

1. **Protocol Registration**: Register protocol handlers on your Windows machine
2. **Handler Implementation**: Handlers call backend via `localhost:3002` (forwarded port)
3. **File Opening**: When you right-click an element and select "Open in Cursor", the handler:
   - Receives the protocol request (e.g., `cursor://file/path/to/file.tsx:42`)
   - Calls backend: `POST http://localhost:3002/api/trpc/cursor.open`
   - Backend responds, and Cursor IDE opens the file

### Protocol Registration (Windows)

Protocol handlers need to be registered on your Windows machine. A lightweight installer/script will be provided:

```bash
# Protocol handlers will be registered automatically by installer
# Manual registration (if needed):
reg add "HKCU\Software\Classes\cursorfi" /ve /d "URL:cursorfi Protocol" /f
reg add "HKCU\Software\Classes\cursorfi" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\cursorfi\shell\open\command" /ve /d "\"C:\path\to\cursorfi-handler.exe\" \"%1\"" /f
```

The handler executable is a simple script that:
- Parses the protocol URL (file path and line number)
- Calls the backend via `localhost:3002` (using Cursor IDE's port forwarding)
- Opens the file in Cursor IDE using Cursor's API

## Configuration Reference

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

### cursorfi.json

```json
{
  "framework": "nextjs" | "vite" | "astro",
  "frameworkVariant": "app-router" | "pages-router" | null,
  "componentPaths": ["src/components", "app/components"],
  "customSettings": {}
}
```

## Next Steps

- Read the [Feature Specification](../spec.md) for detailed requirements
- Review the [Implementation Plan](../plan.md) for technical details
- Check the [API Contracts](./contracts/README.md) for API documentation
- Explore the [Data Model](../data-model.md) for entity definitions

## Support

For issues, questions, or contributions:
- GitHub Issues: [repository-url]/issues
- Documentation: [documentation-url]

