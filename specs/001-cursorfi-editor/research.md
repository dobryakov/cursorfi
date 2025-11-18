# Research & Technical Decisions

This document consolidates research findings and technical decisions for the CursorFi Visual Site Editor implementation.

## 1. WebSocket Library for Bun

**Decision**: Use Bun's native WebSocket API via `Bun.serve()` with built-in WebSocket support.

**Rationale**: 
- Bun provides native, high-performance WebSocket support through `Bun.serve()` with `websocket` configuration
- No additional dependencies required (reduces bundle size and complexity)
- Native implementation offers better performance than third-party libraries
- Built-in pub/sub capabilities for broadcasting file changes to multiple clients
- Full TypeScript support with proper type definitions
- Handles connection lifecycle (open, message, close, error) natively

**Alternatives Considered**:
- `ws` package: Node.js library, requires compatibility layer for Bun
- `bun:ws`: Not a separate package, WebSocket is built into Bun runtime
- Custom WebSocket server: Unnecessary complexity when native API is available

**Implementation Notes**:
- Use `server.upgrade(req)` in fetch handler to upgrade HTTP requests to WebSocket
- Configure `websocket` object with message, open, close, error handlers
- Use `server.publish()` for broadcasting file change events to all connected clients
- Set appropriate `maxPayloadLength`, `idleTimeout`, and `backpressureLimit` for file sync use case

## 2. Protocol Handler Implementation for Remote Deployment

**Decision**: Implement custom protocol handlers on backend that communicate with Cursor IDE via HTTP/WebSocket bridge.

**Rationale**:
- `cursor://` and `cursorfi://` protocols are typically registered on the client machine (where Cursor IDE runs)
- For remote deployment, we need a bridge: backend receives protocol requests and forwards them to Cursor IDE on local machine
- Backend exposes HTTP endpoints that Cursor IDE can call (reverse direction)
- For opening files from editor: backend sends HTTP request to local Cursor IDE instance (if accessible) or uses WebSocket to notify local proxy
- Protocol registration happens on local machine via installer/script

**Alternatives Considered**:
- Direct protocol handling on remote server: Not possible, protocols are OS-level registrations on client machine
- Browser extension: Adds complexity, requires installation on each client
- Custom protocol server on remote: Would require custom client-side handler anyway

**Implementation Notes**:
- Backend provides `/api/cursor/open` endpoint that accepts file path and line number
- Local machine runs a lightweight proxy service that registers `cursor://` and `cursorfi://` protocols
- Proxy forwards protocol requests to backend via HTTP
- Backend can also initiate file opens by calling local proxy endpoint (if network allows)
- Document protocol registration for macOS and Windows in setup instructions

## 3. AST Transformation Strategy for Code Preservation

**Decision**: Use TypeScript Compiler API for parsing and structure analysis, babel-traverse for targeted modifications, preserving all non-styling code.

**Rationale**:
- TypeScript Compiler API provides accurate parsing of TS/TSX files with full type information
- babel-traverse allows surgical modifications to AST nodes (specifically className attributes)
- Combination provides: accurate parsing + flexible transformation
- Preserve all nodes except className/class attributes on JSX elements
- Maintain comments, formatting, and code structure using AST printer

**Alternatives Considered**:
- Pure TypeScript Compiler API: More verbose for transformations, better for analysis
- Pure Babel: Less accurate TypeScript parsing, but good for transformations
- Regex-based replacement: Too fragile, can break code structure
- jscodeshift: Good but adds another dependency, TypeScript support is limited

**Implementation Notes**:
- Parse file with TypeScript Compiler API to get SourceFile
- Use babel-traverse to visit JSX elements and modify only className attributes
- Preserve all other attributes, children, and component logic
- Use Prettier or TypeScript formatter to ensure consistent code output
- Test extensively with various component structures (nested, conditional, loops)

## 4. craft.js + React 19 Compatibility

**Decision**: Use craft.js with React 19, ensuring compatibility through proper React.forwardRef usage and testing.

**Rationale**:
- craft.js uses standard React patterns (hooks, refs, context) that are compatible with React 19
- React 19 maintains backward compatibility with React 18 patterns
- craft.js requires `React.forwardRef` for drag connectors, which works in React 19
- React Compiler should work transparently with craft.js (compiles hooks and context usage)
- No breaking changes in craft.js API that would prevent React 19 usage

**Alternatives Considered**:
- Downgrade to React 18: Not aligned with constitution (Principle 2 requires React 19)
- Alternative canvas library: craft.js is specifically designed for page editors, best fit for use case
- Wait for official React 19 support: Unnecessary, compatibility is expected

**Implementation Notes**:
- Test craft.js Editor, Frame, and useNode hooks with React 19
- Ensure all drag connectors use React.forwardRef properly
- Verify React Compiler doesn't break craft.js internal state management
- Monitor craft.js GitHub for any React 19-specific issues or updates

## 5. File Watching Performance Optimization

**Decision**: Use chokidar with optimized configuration: ignore node_modules and build directories, use polling only if needed, configure inotify limits.

**Rationale**:
- chokidar is the industry standard for cross-platform file watching
- Supports ignoring patterns to reduce watch overhead
- Can use native file system events (inotify on Linux) for better performance
- Configurable polling as fallback for problematic file systems
- Supports debouncing and atomic write detection

**Alternatives Considered**:
- Node.js fs.watch: Less reliable, cross-platform issues
- Custom file watcher: Unnecessary complexity, chokidar is battle-tested
- Polling-only approach: Higher CPU usage, less efficient

**Implementation Notes**:
- Configure chokidar to ignore: `node_modules/`, `.next/`, `.vite/`, `.astro/`, `dist/`, `build/`
- Only watch relevant directories: `src/`, `app/`, `pages/`, `components/`
- Use `awaitWriteFinish` option to handle atomic writes (prevents duplicate events)
- Set `stabilityThreshold: 200ms` to debounce rapid file changes
- On Linux, increase `fs.inotify.max_user_watches` if needed: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
- Use `usePolling: false` by default (native events), enable only if issues occur
- Batch file change events and send single WebSocket message per batch

## 6. Conflict Resolution Implementation

**Decision**: Implement last-write-wins with timestamp comparison, visual indicators via toast notifications and conflict badges on affected elements.

**Rationale**:
- Last-write-wins is simplest and most predictable for developers
- Timestamp-based comparison is reliable and doesn't require complex merge logic
- Visual indicators (toasts + badges) inform users without blocking workflow
- Matches user expectation: "most recent change wins"
- Avoids complex operational transformation or CRDT implementations

**Alternatives Considered**:
- Operational Transformation (OT): Too complex for file-based sync, overkill
- CRDTs: Complex, requires specialized data structures, not suitable for code files
- Manual conflict resolution UI: Blocks workflow, poor UX
- Three-way merge: Complex, requires diff algorithms, may produce invalid code

**Implementation Notes**:
- Store last modified timestamp with each file write operation
- On file change detection, compare timestamps: if external change is newer, apply it
- Show toast notification: "File updated externally, canvas refreshed"
- Add visual badge to affected elements on canvas (red dot or "External" label)
- Badge disappears after user interacts with element or after 5 seconds
- Log conflict events for observability (trace ID, file path, timestamps)

## 7. Component Scanning Strategy

**Decision**: Parallel file scanning with caching, parse only component files (TSX/JSX), extract component metadata without full AST parsing initially.

**Rationale**:
- Parallel processing reduces initial scan time for 100+ components
- Cache component metadata to avoid re-scanning on every editor load
- Extract only necessary info (name, props, file path) without full parsing
- Full AST parsing happens on-demand when component is used
- Use file system glob patterns to find component files efficiently

**Alternatives Considered**:
- Sequential scanning: Too slow for large projects
- Full AST parsing upfront: Unnecessary overhead, most components may not be used
- Database storage: Adds complexity, file system is source of truth
- Incremental scanning only: Users expect immediate availability on first load

**Implementation Notes**:
- Use Bun's native `glob` or `node:fs/promises.glob` to find all TSX/JSX files
- Filter to component directories: `src/components/`, `src/app/`, `app/`, `pages/`
- Parallel processing: Process files in batches of 10-20 concurrently
- Extract component name from file name and default export
- Cache metadata in memory (Map<filePath, ComponentMetadata>)
- Invalidate cache when files are added/removed (via chokidar)
- Full component parsing (props, structure) happens when dragged onto canvas

## 8. Remote Protocol Communication

**Decision**: Leverage Cursor IDE's built-in port forwarding to access backend directly via localhost, use protocol handlers for opening files in IDE.

**Rationale**:
- Cursor IDE automatically forwards ports from remote server to local Windows machine
- Backend ports (e.g., 3002) are accessible as `localhost:3002` on Windows machine
- Protocol handlers (cursor://, cursorfi://) can directly call backend endpoints via forwarded ports
- No need for separate proxy service - Cursor IDE's port forwarding handles network communication
- Simpler architecture: backend → forwarded port → protocol handler → Cursor IDE
- WebSocket connections also work through port forwarding

**Alternatives Considered**:
- Separate proxy service: Unnecessary complexity when Cursor IDE already provides port forwarding
- Direct WebSocket between editor and IDE: Requires Cursor IDE to expose WebSocket (not available)
- SSH tunnel: Adds complexity, Cursor IDE's port forwarding is sufficient
- Browser extension: Requires installation, adds friction
- Custom protocol over WebSocket: Unnecessary, HTTP through forwarded ports is sufficient

**Implementation Notes**:
- Backend exposes: `POST /api/trpc/cursor.open` (file path, line number)
- Protocol handlers (cursor://, cursorfi://) registered on Windows machine:
  - Receive protocol requests (e.g., `cursor://file/path/to/file.tsx:42`)
  - Parse file path and line number
  - Call backend via forwarded port: `http://localhost:3002/api/trpc/cursor.open`
  - Backend responds with success/error
  - Protocol handler opens file in Cursor IDE using Cursor's API
- For opening files from editor (right-click → "Open in Cursor"):
  - Frontend calls backend: `POST /api/trpc/cursor.open`
  - Backend can directly open file if it has access to Cursor IDE API, OR
  - Backend sends WebSocket message to frontend, frontend triggers protocol handler
- Port forwarding is automatic when Cursor IDE is connected to remote server
- Document that users need Cursor IDE connected to remote server for integration to work
- Protocol handler can be lightweight script/executable that uses forwarded ports

## 9. Tailwind CSS v4 Integration

**Decision**: Use Tailwind CSS v4 with Vite plugin, configure for semantic class generation, ensure compatibility with code generator.

**Rationale**:
- Tailwind v4 is the latest version with improved performance and features
- Vite has official Tailwind plugin support
- v4 maintains backward compatibility with v3 class names
- Semantic utilities (translate-x, grid-cols, etc.) work the same way
- Code generator can use same class names regardless of Tailwind version

**Alternatives Considered**:
- Tailwind v3: Older version, v4 is required by constitution
- PostCSS-only setup: More configuration, Vite plugin is simpler
- Custom CSS-in-JS: Defeats purpose of using Tailwind

**Implementation Notes**:
- Install `tailwindcss@^4.0.0` and `@tailwindcss/vite` plugin
- Configure `tailwind.config.ts` with content paths for component scanning
- Ensure JIT mode is enabled (default in v4)
- Test that generated semantic classes work correctly
- Verify dark mode classes work: `dark:bg-gray-800`, etc.
- Code generator should use standard Tailwind utilities (no v4-specific features initially)

## 10. State Persistence Strategy

**Decision**: In-memory state with file-based persistence on save, per-page state stored in project metadata file.

**Rationale**:
- In-memory state provides fast access and real-time updates
- File-based persistence ensures state survives editor restarts
- Per-page state allows multi-page editing without conflicts
- Metadata file (`.cursorfi/pages.json`) stores page-to-file mappings and canvas state
- State is source of truth for visual representation, files are source of truth for code

**Alternatives Considered**:
- Database storage: Overkill, adds complexity, file system is sufficient
- Browser localStorage: Limited size, not accessible from backend
- Full state in code files: Would pollute user's code with editor metadata
- No persistence: Poor UX, users lose work on refresh

**Implementation Notes**:
- Zustand store holds current page's canvas state in memory
- On page switch: load state from metadata file or parse from code file
- On save: persist canvas state to `.cursorfi/pages.json`
- Metadata structure: `{ [pagePath]: { elements: [...], lastModified: timestamp } }`
- `.cursorfi/` directory in project root (hidden, gitignored)
- State includes: element tree, selected element, undo/redo history (last 50 actions)
- On editor load: restore last viewed page state

## 11. Page Structure Storage Architecture

**Decision**: Dual-source architecture: JSON DSL (craft.js state) for visual editor, JS/TS code files as source of truth. Bidirectional sync between both representations.

**Rationale**:
- craft.js uses JSON format for internal state representation (nodes, props, hierarchy)
- JSON DSL provides fast visual editing and undo/redo capabilities
- JS/TS code files remain the actual source code that runs in production
- Two-way sync ensures both representations stay in sync
- JSON is stored in `.cursorfi/pages.json` for persistence and fast loading
- Code files are parsed to reconstruct JSON when needed (code → visual sync)

**Storage Locations**:

1. **In-Memory (Zustand Store)**:
   - Current page's canvas state as JSON object
   - Fast access for visual operations
   - Updated on every user interaction

2. **Metadata File (`.cursorfi/pages.json`)**:
   - Persistent storage of canvas state as JSON
   - Structure: `{ [pagePath]: { canvasState: {...}, lastModified: timestamp } }`
   - Used for fast page switching and editor restart recovery
   - Gitignored (not committed to repository)

3. **Code Files (JS/TS/JSX/TSX)**:
   - Actual source code that runs in production
   - Contains React components with Tailwind classes
   - Source of truth for code representation
   - Parsed to reconstruct JSON when code changes externally

**JSON DSL Structure (craft.js format)**:

```json
{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "isCanvas": true,
    "props": { "className": "flex flex-col gap-4" },
    "displayName": "Container",
    "custom": {},
    "nodes": ["node-1", "node-2"]
  },
  "node-1": {
    "type": { "resolvedName": "Button" },
    "isCanvas": false,
    "props": { 
      "className": "px-4 py-2 bg-blue-500 text-white",
      "children": "Click me"
    },
    "displayName": "Button",
    "custom": { "data-cf-id": "node-1" },
    "parent": "ROOT"
  }
}
```

**Synchronization Flow**:

1. **Visual → Code (User edits in canvas)**:
   - User action → craft.js updates JSON state in memory
   - Debounce (400ms) → AST transformation → Generate JS/TS code
   - Write code to file → Update `.cursorfi/pages.json` with new state

2. **Code → Visual (External code change)**:
   - File watcher detects change → Parse JS/TS file with TypeScript Compiler API
   - Extract component tree, props, className attributes
   - Reconstruct craft.js JSON structure
   - Update Zustand store → Canvas re-renders

3. **Initial Load**:
   - Check `.cursorfi/pages.json` for cached state
   - If exists and file hasn't changed: load JSON directly (fast)
   - If file changed or no cache: parse code file → generate JSON → cache in metadata

**Key Points**:
- **JSON DSL is the working format** for visual editing (craft.js native format)
- **Code files are the source of truth** for what actually runs
- **Bidirectional sync** ensures both stay in sync
- **Metadata file** provides fast loading and persistence
- **Parsing is on-demand** when code changes externally or cache is invalid

**Code Preservation**:
- When generating code from JSON: only modify className and structural props
- Preserve all user code inside components (logic, hooks, state)
- Use AST manipulation to surgically update only styling-related attributes
- Never modify component function bodies or user-defined logic

## Summary

All technical unknowns have been resolved with concrete decisions based on:
- Constitution compliance (modern stack, container-first)
- Performance requirements (100ms visual response, 500ms sync)
- Developer experience (code preservation, seamless integration)
- Remote deployment constraints (protocol handlers, network communication)

**Key Architecture Decisions**:
1. **WebSocket**: Bun's native WebSocket API
2. **Protocol Handlers**: Use Cursor IDE's automatic port forwarding
3. **AST Transformation**: TypeScript Compiler API + babel-traverse
4. **File Watching**: chokidar with optimized configuration
5. **State Storage**: Dual-source architecture (JSON DSL + code files) with bidirectional sync

All decisions align with the 10 core principles and support the feature requirements.

