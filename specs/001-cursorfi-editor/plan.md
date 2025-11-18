# Implementation Plan: CursorFi Visual Site Editor

## Constitution Check

Before proceeding, verify compliance with:
- [x] Principle 1: Container-First Architecture (all services in Docker)
- [x] Principle 2: Modern Technology Stack Compliance (Bun, TypeScript, etc.)
- [x] Principle 3: Mandatory Testing at Every Phase (tests in containers)
- [x] Principle 4: Two-Way Synchronization Integrity (core requirement)
- [x] Principle 5: Code Preservation and Non-Destructive Editing (core requirement)
- [x] Principle 6: Configuration Externalization (no hardcoded values)
- [x] Principle 7: Semantic Tailwind Class Generation (core requirement)
- [x] Principle 8: Cursor IDE Integration (core requirement)
- [x] Principle 9: Multi-Framework Support (core requirement)
- [x] Principle 10: Remote Development Support (core requirement)

**Status**: All principles are applicable and will be enforced throughout implementation.

**Post-Design Re-evaluation** (Phase 1 Complete):
- ✅ **Principle 1**: Architecture uses Docker containers (frontend, backend, test) with docker-compose
- ✅ **Principle 2**: Technology stack confirmed: Bun, TypeScript 5.6+, React 19, Vite 6, Tailwind v4, craft.js, tRPC, Elysia
- ✅ **Principle 3**: Testing strategy defined: Vitest (unit/integration), Playwright (E2E), all in containers
- ✅ **Principle 4**: Two-way sync designed: visual→code (debounced writes), code→visual (file watcher + WebSocket)
- ✅ **Principle 5**: Code preservation strategy: AST manipulation preserving user code, only modifying className attributes
- ✅ **Principle 6**: All configuration externalized: .env for environment variables, cursorfi.json for project config, no hardcoded ports
- ✅ **Principle 7**: Semantic Tailwind classes: code generator uses translate-x/y, grid-cols, flex utilities, no arbitrary values
- ✅ **Principle 8**: Cursor IDE integration: protocol handlers (cursor://, cursorfi://) using Cursor IDE's built-in port forwarding
- ✅ **Principle 9**: Multi-framework support: Next.js (App/Pages Router), Vite, Astro with auto-detection
- ✅ **Principle 10**: Remote deployment: backend on remote server, Cursor IDE's automatic port forwarding enables seamless communication

**Conclusion**: All principles are fully addressed in the design. No violations detected.

## Overview

CursorFi is a visual site editor that runs in a web browser, providing a Figma/Webflow-style interface for building pages. The system maintains perfect bidirectional synchronization between the visual canvas and local project files, enabling developers to edit visually while maintaining clean, editable code. The editor integrates deeply with Cursor IDE and supports Next.js, Vite, and Astro projects.

**Key Capabilities**:
- Visual drag-and-drop page builder with 40+ pre-built components
- Real-time two-way sync between canvas and code files
- Multi-framework support (Next.js, Vite, Astro)
- Cursor IDE integration (cursor:// and cursorfi:// protocols)
- Code preservation (never breaks existing code)
- Component auto-discovery from project files

## Technical Context

### Technology Stack (from Constitution)

**Frontend**:
- TypeScript 5.6+
- Bun (package manager and runtime)
- Vite 6 + React 19 + React Compiler
- Tailwind CSS v4
- shadcn/ui + Radix UI + Lucide icons
- craft.js (latest 2025 version) - canvas foundation
- @dnd-kit - complex drag-and-drop scenarios
- Zustand - state management

**Backend**:
- Bun runtime
- tRPC + Elysia
- Zod - all schemas
- chokidar - file watching
- TypeScript Compiler API + babel-traverse - code parsing and generation

**Testing**:
- Vitest - unit and integration tests
- Playwright - E2E tests

### Architecture Decisions

**Container Structure**:
- `frontend` container: Serves React application (Vite dev server)
- `backend` container: Elysia API server with tRPC endpoints
- `test` container: Separate container for Playwright E2E tests
- All containers use Bun base images
- Project directory mounted as volume into backend container

**Service Communication**:
- Frontend proxies API requests to backend
- Backend watches project files via chokidar
- WebSocket connection for real-time file change notifications (NEEDS CLARIFICATION: WebSocket library choice)
- Protocol handlers (cursor://, cursorfi://) handled by backend (NEEDS CLARIFICATION: protocol handler implementation details)

**Data Flow**:
1. Visual → Code: User action → debounce (400ms) → craft.js state → AST transformation → code generation → file write
2. Code → Visual: File change detected → AST parsing → craft.js state update → canvas re-render
3. Element tracking: data-cf-id attributes map visual elements to code nodes

### Technical Unknowns (NEEDS CLARIFICATION)

1. **WebSocket Library**: Which WebSocket library for Bun? (ws, bun:ws, or native Bun WebSocket?)
2. **Protocol Handler Implementation**: How to implement cursor:// and cursorfi:// protocol handlers? (RESOLVED: Use Cursor IDE's port forwarding - handlers call backend via localhost:3002)
3. **AST Transformation Strategy**: Best practices for preserving user code while modifying only Tailwind classes using TypeScript Compiler API + babel-traverse?
4. **craft.js Integration**: How to integrate craft.js with React 19 and React Compiler? (Compatibility considerations)
5. **File Watching Performance**: How to handle file watching for 100+ component projects without performance degradation? (chokidar configuration, debouncing strategies)
6. **Conflict Resolution**: Implementation details for last-write-wins with visual indicators (notification system, state management)
7. **Component Scanning**: Efficient strategy for scanning and parsing 100+ components on initial load? (Parallel processing, caching)
8. **Remote Protocol Communication**: How to establish communication between remote server (editor) and local machine (Cursor IDE)? (RESOLVED: Cursor IDE automatically forwards ports, handlers use localhost:3002)
9. **Tailwind v4 Integration**: How to integrate Tailwind CSS v4 with Vite 6 and ensure semantic class generation works correctly?
10. **State Persistence**: How to persist craft.js canvas state? (In-memory only, or file-based persistence for multi-page support?)

### Dependencies

**New Packages** (to be confirmed in research phase):
- craft.js (latest 2025 version)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- chokidar
- @typescript/compiler (TypeScript Compiler API)
- @babel/traverse
- zod
- elysia
- @elysiajs/trpc (or tRPC adapter for Elysia)
- WebSocket library (TBD)
- Protocol handler: Lightweight script that uses Cursor IDE's port forwarding (no separate library needed)

**Container Base Images**:
- Frontend: `oven/bun:latest` (or specific version)
- Backend: `oven/bun:latest`
- Test: Debian-based image with Bun + Playwright browsers

### Integration Points

1. **Cursor IDE Port Forwarding**: Cursor IDE automatically forwards backend port (3002) to localhost on Windows machine
2. **Cursor IDE Protocol**: cursor://file/ protocol for opening files (uses forwarded port to call backend)
3. **CursorFi Protocol**: cursorfi:// protocol for opening pages from Cursor (uses forwarded port)
4. **File System**: Direct file access via volume mounts
5. **Project Structure Detection**: Auto-detect Next.js (App/Pages Router), Vite, Astro

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 19 + Vite 6 + craft.js Canvas                 │   │
│  │  - Visual editor UI                                   │   │
│  │  - Drag-and-drop interface                           │   │
│  │  - Component library sidebar                         │   │
│  │  - Zustand state management                          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket
                        │ (tRPC)
┌───────────────────────┴─────────────────────────────────────┐
│              Backend Container (Elysia + tRPC)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Endpoints (tRPC)                                │   │
│  │  - File operations (read/write)                      │   │
│  │  - Component scanning                                │   │
│  │  - Code parsing/generation                           │   │
│  │  - Sync operations                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File Watcher (chokidar)                             │   │
│  │  - Monitor project files                             │   │
│  │  - Detect external changes                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Code Parser/Generator                               │   │
│  │  - TypeScript Compiler API                           │   │
│  │  - babel-traverse                                    │   │
│  │  - AST manipulation                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Volume Mount
┌───────────────────────┴─────────────────────────────────────┐
│              Project Directory (Remote Server)              │
│  - Next.js/Vite/Astro project files                        │
│  - Components, pages, styles                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Cursor IDE Port Forwarding (Automatic)              │
│  - Forwards backend port 3002 → localhost:3002             │
│  - Forwards frontend port 3001 → localhost:3001            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket via forwarded ports
┌───────────────────────┴─────────────────────────────────────┐
│              Cursor IDE (Local Windows Machine)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Protocol Handlers                                   │   │
│  │  - cursor:// protocol → calls localhost:3002        │   │
│  │  - cursorfi:// protocol → calls localhost:3002      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Container Structure

**docker-compose.yml services**:
- `frontend`: Vite dev server, serves React app
- `backend`: Elysia API server, file operations, code parsing
- `test`: Playwright E2E test container (connects to frontend/backend)

**Volume Mounts**:
- Project directory (from CURSORFI_PROJECT_PATH) → `/app/project` in backend container

**Network**:
- Frontend and backend on same Docker network
- Frontend proxies `/api/*` to backend
- WebSocket connection for real-time updates
- Cursor IDE automatically forwards ports to local Windows machine:
  - Backend port 3002 → accessible as `localhost:3002` on Windows
  - Frontend port 3001 → accessible as `localhost:3001` on Windows

## Implementation Steps

### Phase 0: Research & Clarification
1. Research WebSocket library options for Bun
2. Research protocol handler implementation for remote deployment
3. Research AST transformation best practices for code preservation
4. Research craft.js + React 19 compatibility
5. Research file watching performance optimization
6. Research conflict resolution patterns
7. Research component scanning strategies
8. Research remote protocol communication
9. Research Tailwind v4 integration
10. Research state persistence strategies

### Phase 1: Foundation & Core Services
1. Set up project structure (monorepo or separate repos?)
2. Initialize frontend container (Vite + React 19 + Tailwind v4)
3. Initialize backend container (Elysia + tRPC)
4. Set up docker-compose.yml with all services
5. Implement basic file operations API (read/write)
6. Implement file watcher service (chokidar)
7. Set up WebSocket connection for real-time updates
8. Implement basic code parser (TypeScript Compiler API)
9. Implement basic code generator (AST → formatted code)
10. Set up Zustand store structure

### Phase 2: Visual Editor Core
1. Integrate craft.js with React 19
2. Implement canvas component with drag-and-drop
3. Implement component library sidebar
4. Implement basic block types (10+ components)
5. Implement element selection and properties panel
6. Implement undo/redo functionality
7. Implement element tracking (data-cf-id system)

### Phase 3: Two-Way Synchronization
1. Implement visual → code sync (debounced file writes)
2. Implement code → visual sync (file change detection → canvas update)
3. Implement conflict detection and last-write-wins resolution
4. Implement visual conflict indicators (notifications/badges)
5. Add comprehensive sync tests

### Phase 4: Framework Support
1. Implement project structure detection (Next.js/Vite/Astro)
2. Implement component scanner (auto-discover components)
3. Implement multi-page support
4. Implement page switching in editor
5. Add framework-specific tests

### Phase 5: Code Preservation & Generation
1. Implement AST manipulation for code preservation
2. Implement semantic Tailwind class generation
3. Implement positioning logic (grid/flex/absolute)
4. Add 20+ positioning scenario tests
5. Verify code preservation in all operations

### Phase 6: Cursor IDE Integration
1. Implement cursor:// protocol handler (uses Cursor IDE's port forwarding)
2. Implement cursorfi:// protocol handler (uses port forwarding)
3. Implement right-click "Open in Cursor" functionality
4. Backend endpoint `/api/trpc/cursor.open` accessible via forwarded port
5. Protocol handlers call backend via `localhost:3002` (forwarded port)
6. Add integration tests

### Phase 7: Component Library
1. Create 40+ pre-built page sections
2. Ensure all components support dark mode
3. Ensure all components are responsive
4. Add components to library sidebar

### Phase 8: Polish & Testing
1. Implement loading states and indicators
2. Implement empty state placeholders
3. Implement error handling with recovery actions
4. Add comprehensive E2E tests (all user scenarios)
5. Performance optimization
6. Documentation

## Testing Strategy

### Unit Tests (Vitest, in service containers)
- Code parser: Handle TSX, JSX, TS, JS files
- Code generator: Produce valid, formatted code
- Element tracking: Maintain correct mappings
- Tailwind class generation: Follow semantic rules
- Code preservation: Maintain user code integrity
- State management: Zustand store operations

### Integration Tests (Vitest, in service containers)
- File watcher: Detect changes correctly
- Synchronization layer: Handle concurrent edits
- Component scanner: Identify all project components
- Framework detection: Work for all supported frameworks
- Protocol handlers: Communicate correctly via Cursor IDE's port forwarding
- API endpoints: tRPC procedures work correctly

### E2E Tests (Playwright, in test container)
- Complete visual-to-code sync cycle
- Complete code-to-visual sync cycle
- Multi-page editing
- Component import
- Cursor IDE integration
- Code preservation
- 20+ positioning scenarios
- Loading/error/empty states
- All user scenarios from spec

**Test Container Setup**:
- Debian-based image with Bun
- Playwright browsers installed
- Connects to frontend/backend via docker-compose network
- Can access project files via shared volume

## Configuration Changes

### New Environment Variables
- `CURSORFI_PROJECT_PATH`: Path to target project directory on remote server (required)
- `CURSORFI_FRONTEND_PORT`: Port for web frontend (default: 3001, non-standard)
- `CURSORFI_BACKEND_PORT`: Port for backend service (default: 3002, non-standard)
- `CURSORFI_SYNC_DEBOUNCE_MS`: Debounce delay for file writes (default: 400)
- `CURSORFI_FILE_WATCH_INTERVAL`: File watching poll interval (if needed)
- `CURSORFI_LOG_LEVEL`: Logging level (info, warn, error, default: info)
- `CURSORFI_TRACE_ENABLED`: Enable request tracing (default: true)

### New Config Files
- `cursorfi.json`: Global configuration file (single file, not in user projects)
  - Project path (must be on remote server where editor runs)
  - Framework type (auto-detected, can be overridden)
  - Component scan paths
  - Custom settings

### Port Configuration
- Frontend: 3001 (configurable, non-standard)
- Backend: 3002 (configurable, non-standard)
- All ports externalized to .env

## Dependencies

### New Packages (to be finalized in research phase)
**Frontend**:
- react@^19.0.0
- react-dom@^19.0.0
- vite@^6.0.0
- @vitejs/plugin-react@^4.0.0
- tailwindcss@^4.0.0
- craft.js (latest 2025 version)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- zustand
- @radix-ui/* (components from shadcn/ui)
- lucide-react
- zod
- @trpc/client

**Backend**:
- elysia
- @elysiajs/trpc (or tRPC adapter)
- @trpc/server
- chokidar
- typescript (for Compiler API)
- @babel/traverse
- @babel/types
- zod
- WebSocket library (TBD)

**Testing**:
- vitest
- @vitest/ui
- playwright
- @playwright/test

**Dev Dependencies**:
- @types/node
- @types/react
- @types/react-dom
- typescript@^5.6.0

### Container Base Images
- Frontend: `oven/bun:latest` (or specific version like `oven/bun:1.1.0`)
- Backend: `oven/bun:latest`
- Test: `mcr.microsoft.com/playwright:v1.40.0-focal` (Debian-based) + Bun installation

## Success Criteria

- [ ] All tests pass in containers (unit, integration, E2E)
- [ ] Documentation updated (README, quickstart, API docs)
- [ ] Configuration externalized (all values in .env or cursorfi.json)
- [ ] No hardcoded values (ports, paths, etc.)
- [ ] Compliance with all 10 principles verified
- [ ] Visual-to-code sync works within 500ms
- [ ] Code-to-visual sync works within 500ms
- [ ] Code preservation verified (100% user code intact)
- [ ] Framework support verified (Next.js, Vite, Astro)
- [ ] Cursor IDE integration works (remote deployment)
- [ ] 40+ pre-built components available
- [ ] All user scenarios pass E2E tests
- [ ] Performance targets met (100ms visual response, 500ms sync)
- [ ] Handles 100+ component projects without degradation

## Gates

### Gate 1: Constitution Compliance
**Status**: ✅ PASS
- All 10 principles are applicable and will be enforced
- No violations identified
- Architecture aligns with container-first approach
- Technology stack matches constitution requirements

### Gate 2: Technical Feasibility
**Status**: ⚠️ NEEDS CLARIFICATION
- 10 technical unknowns identified (see Technical Unknowns section)
- Research phase required to resolve all clarifications
- No blockers identified, but implementation details need confirmation

### Gate 3: Dependencies Availability
**Status**: ⚠️ NEEDS VERIFICATION
- All packages appear to be available
- craft.js latest 2025 version needs verification
- WebSocket library choice needs research
- Protocol handler implementation: Use Cursor IDE's port forwarding (simplified architecture)

**Action Required**: Complete Phase 0 research before proceeding to implementation.
