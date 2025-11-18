# Data Model

This document defines the core entities, their relationships, validation rules, and state transitions for the CursorFi Visual Site Editor.

## Entities

### 1. Project

**Description**: Represents a user's project that is being edited in CursorFi.

**Fields**:
- `id`: string (UUID) - Unique project identifier
- `path`: string - Absolute path to project directory on remote server
- `framework`: 'nextjs' | 'vite' | 'astro' - Detected or configured framework type
- `frameworkVariant`: string | null - Framework variant (e.g., 'app-router', 'pages-router' for Next.js)
- `componentPaths`: string[] - Array of directories to scan for components (e.g., ['src/components', 'app'])
- `createdAt`: Date - Project creation timestamp
- `updatedAt`: Date - Last update timestamp

**Validation Rules**:
- `path` must be an absolute path
- `path` must exist and be accessible (readable/writable)
- `framework` must be one of the supported frameworks
- `componentPaths` must be relative to project root

**Relationships**:
- Has many `Page` entities
- Has many `Component` entities
- Has one `ProjectMetadata` entity

### 2. Page

**Description**: Represents a single page/route in the project that can be edited visually.

**Fields**:
- `id`: string (UUID) - Unique page identifier
- `projectId`: string (UUID) - Foreign key to Project
- `filePath`: string - Relative path to page file (e.g., 'app/page.tsx', 'src/pages/about.tsx')
- `route`: string - URL route (e.g., '/', '/about')
- `title`: string | null - Display name for the page
- `canvasState`: CanvasState - Serialized craft.js state (see CanvasState entity)
- `lastSyncedAt`: Date - Timestamp of last successful sync with file
- `lastModifiedAt`: Date - Timestamp of last modification (visual or code)
- `createdAt`: Date - Page creation timestamp

**Validation Rules**:
- `filePath` must be relative to project root
- `filePath` must have valid extension (.tsx, .jsx, .ts, .js)
- `route` must be a valid URL path (starts with '/')
- `canvasState` must be valid craft.js serialized state

**State Transitions**:
- `draft` → `synced`: When visual changes are successfully written to file
- `synced` → `draft`: When user makes visual changes
- `synced` → `conflict`: When external file change detected during edit
- `conflict` → `synced`: When conflict resolved (last-write-wins applied)

**Relationships**:
- Belongs to one `Project`
- Has one `CanvasState` (embedded)

### 3. Component

**Description**: Represents a React component that can be dragged onto the canvas or is already used in pages.

**Fields**:
- `id`: string (UUID) - Unique component identifier
- `projectId`: string (UUID) - Foreign key to Project
- `name`: string - Component name (extracted from file/export)
- `filePath`: string - Relative path to component file
- `props`: ComponentProp[] - Array of component prop definitions
- `isBuiltIn`: boolean - Whether component is from pre-built library (true) or user-defined (false)
- `category`: string | null - Category for organization (e.g., 'layout', 'form', 'content')
- `thumbnail`: string | null - URL or path to thumbnail image
- `metadata`: ComponentMetadata - Additional metadata (see ComponentMetadata entity)
- `lastScannedAt`: Date - Timestamp of last component scan/parse
- `createdAt`: Date - Component discovery timestamp

**Validation Rules**:
- `name` must be a valid JavaScript identifier
- `filePath` must be relative to project root
- `filePath` must have valid extension (.tsx, .jsx, .ts, .js)
- `props` must be valid prop definitions

**Relationships**:
- Belongs to one `Project`
- Can be used in many `CanvasElement` instances

### 4. ComponentProp

**Description**: Represents a prop definition for a Component.

**Fields**:
- `name`: string - Prop name
- `type`: string - TypeScript type string (e.g., 'string', 'number', 'ReactNode')
- `required`: boolean - Whether prop is required
- `defaultValue`: any | null - Default value if not provided
- `description`: string | null - Prop description/documentation

**Validation Rules**:
- `name` must be a valid JavaScript identifier
- `type` must be a valid TypeScript type string

### 5. ComponentMetadata

**Description**: Additional metadata for a Component.

**Fields**:
- `description`: string | null - Component description
- `tags`: string[] - Tags for searching/filtering
- `author`: string | null - Component author (for pre-built components)
- `version`: string | null - Component version
- `darkModeSupport`: boolean - Whether component supports dark mode
- `responsive`: boolean - Whether component is responsive

### 6. CanvasState

**Description**: Serialized state of the craft.js editor canvas.

**Fields**:
- `nodes`: Record<string, CanvasNode> - Map of node IDs to node data
- `events`: CanvasEvent[] - History of events (for undo/redo)
- `selectedNodeId`: string | null - Currently selected node ID
- `viewport`: Viewport - Canvas viewport state (zoom, pan)

**Validation Rules**:
- `nodes` must form a valid tree structure (one root node)
- `selectedNodeId` must reference a valid node ID or be null
- `events` array length should be limited (e.g., max 50 for undo/redo)

**State Transitions**:
- State is modified on every user action (drag, resize, style change)
- State is serialized to JSON for persistence
- State is deserialized from JSON on page load

### 7. CanvasNode

**Description**: Represents a single element/node in the craft.js canvas.

**Fields**:
- `id`: string - Unique node ID (data-cf-id attribute value)
- `type`: string - Component type (e.g., 'Button', 'Container', 'Text')
- `props`: Record<string, any> - Component props including className
- `children`: string[] - Array of child node IDs
- `parent`: string | null - Parent node ID (null for root)
- `displayName`: string - Display name for the node
- `isCanvas`: boolean - Whether node can contain other nodes
- `isDeletable`: boolean - Whether node can be deleted
- `isDraggable`: boolean - Whether node can be dragged
- `custom`: Record<string, any> - Custom node data

**Validation Rules**:
- `id` must be unique within canvas
- `type` must reference a valid Component
- `children` must contain valid node IDs
- `parent` must reference a valid node ID or be null
- Tree structure must be acyclic

**Relationships**:
- References one `Component` (via type field)
- Has many child `CanvasNode` entities
- Belongs to one parent `CanvasNode` (or root)

### 8. CanvasEvent

**Description**: Represents an event in the canvas history (for undo/redo).

**Fields**:
- `id`: string (UUID) - Unique event identifier
- `type`: 'add' | 'remove' | 'update' | 'move' | 'style' - Event type
- `nodeId`: string - Affected node ID
- `timestamp`: Date - Event timestamp
- `data`: Record<string, any> - Event-specific data (previous state, new state, etc.)

**Validation Rules**:
- `type` must be a valid event type
- `nodeId` must reference a valid node
- `data` structure depends on event type

### 9. Viewport

**Description**: Canvas viewport state (zoom, pan position).

**Fields**:
- `zoom`: number - Zoom level (0.5 to 2.0, default 1.0)
- `panX`: number - Horizontal pan offset in pixels
- `panY`: number - Vertical pan offset in pixels

**Validation Rules**:
- `zoom` must be between 0.5 and 2.0
- `panX` and `panY` can be any number

### 10. SyncOperation

**Description**: Represents a synchronization operation between canvas and code file.

**Fields**:
- `id`: string (UUID) - Unique operation identifier
- `pageId`: string (UUID) - Foreign key to Page
- `direction`: 'visual-to-code' | 'code-to-visual' - Sync direction
- `status`: 'pending' | 'in-progress' | 'completed' | 'failed' - Operation status
- `startedAt`: Date - Operation start timestamp
- `completedAt`: Date | null - Operation completion timestamp
- `error`: string | null - Error message if failed
- `traceId`: string - Request trace ID for observability

**Validation Rules**:
- `direction` must be one of the valid directions
- `status` must be one of the valid statuses
- `completedAt` must be null if status is 'pending' or 'in-progress'
- `error` must be null if status is 'completed'

**State Transitions**:
- `pending` → `in-progress`: When operation starts
- `in-progress` → `completed`: When operation succeeds
- `in-progress` → `failed`: When operation fails
- `failed` → `pending`: When operation is retried

**Relationships**:
- Belongs to one `Page`

### 11. FileChangeEvent

**Description**: Represents a file system change event detected by the file watcher.

**Fields**:
- `id`: string (UUID) - Unique event identifier
- `filePath`: string - Relative path to changed file
- `eventType`: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir' - Type of file system event
- `timestamp`: Date - Event timestamp
- `stat`: FileStats | null - File statistics (size, mtime) if available
- `processed`: boolean - Whether event has been processed
- `traceId`: string - Request trace ID for observability

**Validation Rules**:
- `filePath` must be relative to project root
- `eventType` must be a valid file system event type
- `stat` should be present for 'add' and 'change' events

### 12. FileStats

**Description**: File statistics from file system.

**Fields**:
- `size`: number - File size in bytes
- `mtime`: Date - Last modification time
- `isFile`: boolean - Whether path is a file (not directory)

### 13. ProjectMetadata

**Description**: Global project metadata stored in `.cursorfi/pages.json`.

**Fields**:
- `projectId`: string (UUID) - Foreign key to Project
- `pages`: Record<string, PageMetadata> - Map of file paths to page metadata
- `lastSyncedAt`: Date - Last global sync timestamp
- `version`: string - Metadata format version

**Validation Rules**:
- `pages` keys must be valid file paths
- `version` must match expected format version

### 14. PageMetadata

**Description**: Metadata for a single page stored in project metadata file.

**Fields**:
- `filePath`: string - Relative path to page file
- `canvasState`: CanvasState - Serialized canvas state
- `lastModifiedAt`: Date - Last modification timestamp
- `lastSyncedAt`: Date - Last sync timestamp

**Validation Rules**:
- `filePath` must match the key in parent `pages` object
- `canvasState` must be valid serialized state

## Relationships Summary

```
Project (1) ──< (many) Page
Project (1) ──< (many) Component
Project (1) ──< (1) ProjectMetadata

Page (1) ──< (many) SyncOperation
Page (1) ──< (1) CanvasState (embedded)

Component (1) ──< (many) ComponentProp
Component (1) ──< (1) ComponentMetadata (embedded)

CanvasState (1) ──< (many) CanvasNode (tree structure)
CanvasState (1) ──< (many) CanvasEvent
CanvasState (1) ──< (1) Viewport (embedded)

CanvasNode (many) ──< (many) CanvasNode (parent-child tree)
```

## Data Flow

1. **Project Initialization**:
   - User provides project path
   - System creates `Project` entity
   - System scans for components → creates `Component` entities
   - System scans for pages → creates `Page` entities

2. **Visual Editing**:
   - User interacts with canvas → `CanvasState` updated
   - `CanvasEvent` added to history
   - Debounced sync → `SyncOperation` created → `Page.canvasState` updated → file written

3. **Code Editing**:
   - `FileChangeEvent` detected → parsed → `CanvasState` updated → canvas re-rendered
   - `SyncOperation` created and completed

4. **State Persistence**:
   - `CanvasState` serialized → stored in `PageMetadata.canvasState`
   - `ProjectMetadata` written to `.cursorfi/pages.json`

## Validation Rules Summary

- All file paths must be relative to project root
- All UUIDs must be valid UUID v4 format
- All timestamps must be valid Date objects
- Canvas node tree must be acyclic with single root
- Component types must reference valid Component entities
- Sync operations must reference valid Page entities

## State Management

- **In-Memory**: Zustand store holds current page's `CanvasState`
- **Persistence**: `ProjectMetadata` stored in `.cursorfi/pages.json` file
- **Sync**: `SyncOperation` entities track sync status for observability

