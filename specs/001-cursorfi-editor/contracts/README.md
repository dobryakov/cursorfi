# API Contracts

This directory contains the API contract definitions for the CursorFi Visual Site Editor backend.

## Structure

- `api.ts`: Complete tRPC router schema with Zod validation schemas
- `README.md`: This file

## API Overview

The CursorFi backend exposes a tRPC API with the following routers:

### Project Router (`/api/trpc/project.*`)
- `initialize`: Initialize a new project
- `get`: Get project information

### Page Router (`/api/trpc/page.*`)
- `list`: List all pages in the project
- `get`: Get a specific page with canvas state
- `create`: Create a new page
- `updateCanvas`: Update page canvas state (triggers visual → code sync)
- `switch`: Switch to editing a different page

### Component Router (`/api/trpc/component.*`)
- `list`: List all available components
- `scan`: Scan project for new components
- `get`: Get component details including props

### File Router (`/api/trpc/file.*`)
- `read`: Read a file from the project
- `write`: Write content to a file (with validation)

### Sync Router (`/api/trpc/sync.*`)
- `trigger`: Trigger a manual sync operation
- `getStatus`: Get sync operation status
- `list`: Get recent sync operations for a page

### Canvas Router (`/api/trpc/canvas.*`)
- `getState`: Get current canvas state
- `updateState`: Update canvas state (for undo/redo, selection changes)

### Cursor Router (`/api/trpc/cursor.*`)
- `open`: Open a file in Cursor IDE

## WebSocket Events

The backend also exposes WebSocket connections for real-time updates:

- `fileChange`: File change detected by file watcher
- `syncStatus`: Sync operation status update
- `componentScanComplete`: Component scan complete
- `conflict`: Concurrent edit conflict detected

## Usage

These contracts are used to:
1. Generate TypeScript types for frontend tRPC client
2. Validate request/response data at runtime
3. Document API endpoints
4. Generate API documentation

## Implementation Notes

- All procedures use Zod schemas for validation
- All file paths are relative to project root
- All timestamps are Date objects (serialized as ISO strings in JSON)
- All UUIDs are UUID v4 format
- WebSocket events use the same Zod schemas for validation

