# Feature Specification: CursorFi Visual Site Editor

## Constitution Compliance

This specification adheres to the following principles:
- **Principle 1 (Container-First Architecture)**: All services run in Docker containers
- **Principle 2 (Modern Technology Stack)**: Uses specified 2025 technology stack
- **Principle 3 (Mandatory Testing)**: Every phase includes automated tests in containers
- **Principle 4 (Two-Way Synchronization)**: Perfect bidirectional sync between canvas and files
- **Principle 5 (Code Preservation)**: Never breaks existing code, only modifies styling
- **Principle 6 (Configuration Externalization)**: All ports and paths in configuration
- **Principle 7 (Semantic Tailwind Classes)**: Only semantic classes, no inline styles
- **Principle 8 (Cursor IDE Integration)**: Deep integration with Cursor IDE protocols
- **Principle 9 (Multi-Framework Support)**: Supports Next.js, Vite, and Astro
- **Principle 10 (Remote Development)**: Designed for remote server deployment

## Clarifications

### Session 2025-01-27

- Q: When concurrent edits occur (user edits in visual editor while code is modified externally), how should conflicts be resolved? → A: Last-write-wins with visual indicator — apply most recent change and show notification/badge to user
- Q: What observability signals should the system emit for monitoring and debugging? → A: Structured logs + metrics + request tracing — full observability with trace IDs for request flows
- Q: How should the system handle error, empty, and loading states in the visual editor UI? → A: All states with user-friendly messages — loading indicators, empty state placeholders, and clear error messages with recovery actions
- Q: How should the AI-assisted editing feature integrate with AI services? → A: No AI service — AI features disabled initially, deferred to future phase
- Q: Which hosting platforms should the deployment integration support? → A: No deployment integration — remove deployment feature, defer to future phase

## Requirements

### Functional Requirements

1. **Visual Canvas Editor**
   - Users can open a visual editor in a web browser
   - Editor displays an empty canvas for building pages
   - Users can drag and drop pre-built blocks onto the canvas
   - Editor provides at least 10 basic block types (containers, headings, buttons, cards, images, inputs, etc.)
   - Users can visually position, resize, and modify elements on the canvas
   - Editor supports undo/redo operations
   - Editor displays loading indicators during async operations (file loading, sync operations, component scanning)
   - Editor shows user-friendly empty state placeholders when canvas has no content
   - Editor displays clear error messages with recovery actions when operations fail (file access errors, sync failures, parsing errors)

2. **Two-Way File Synchronization**
   - When users make changes in the visual editor, corresponding code files are automatically updated
   - When code files are modified externally, the visual canvas automatically reflects those changes
   - Synchronization works bidirectionally with no data loss
   - File changes are detected automatically without manual refresh
   - Changes from editor to files are debounced to prevent excessive writes

3. **Project Integration**
   - On first launch, users specify the path to their existing project
   - System automatically scans and imports existing components from the project
   - Imported components appear as draggable blocks in the editor
   - System supports multiple pages within a project
   - Users can switch between editing different pages

4. **Code Preservation**
   - System never modifies or removes user-written code within components
   - Only styling classes and structural props are modified
   - User code inside components remains intact after all operations
   - System handles ambiguous positioning gracefully without breaking layout

5. **Framework Support**
   - Works with Next.js projects (both App Router and Pages Router)
   - Works with Vite projects
   - Works with Astro projects
   - Automatically detects project structure and adapts accordingly

6. **Cursor IDE Integration**
   - Users can right-click elements in the editor to open corresponding code in Cursor IDE
   - System supports opening specific files and line numbers in Cursor IDE
   - Users can trigger editor from Cursor IDE to open specific pages
   - Full compatibility with Cursor Composer features

7. **Pre-built Component Library**
   - Editor includes 40+ ready-to-use page sections (Hero, Navbar, Pricing, Testimonials, FAQ, CTA, Footer, etc.)
   - All pre-built components support dark mode
   - All pre-built components are responsive and work on mobile devices

### Non-Functional Requirements

- **Performance**: 
  - Visual changes appear on canvas within 100ms of user action
  - File synchronization completes within 500ms of change detection
  - Editor loads in under 3 seconds on standard development machines
  - System handles projects with 100+ components without performance degradation

- **Security**: 
  - System only accesses files within the specified project directory
  - No code or project data is transmitted to external servers without explicit user action
  - File watching respects system permissions and access controls

- **Compatibility**: 
  - Works with TypeScript, JavaScript, JSX, and TSX files
  - Supports projects using Tailwind CSS
  - Compatible with existing project structures without requiring modifications
  - Works when editor runs on remote server and IDE runs on local machine

- **Reliability**:
  - System recovers gracefully from file system errors
  - Concurrent edits (editor and external) are handled using last-write-wins strategy with visual indicators (notifications/badges) to inform users of conflicts
  - System validates code before writing to prevent syntax errors

- **Observability**:
  - Structured logging with levels (info, warn, error) for all operations
  - Metrics for sync operations, errors, performance (latency, throughput)
  - Request tracing with trace IDs to track request flows through all system components
  - Diagnostic output and trace IDs included in logs to enable end-to-end request tracking

## Scope

### In Scope

- Visual drag-and-drop page builder interface
- Two-way synchronization between visual editor and code files
- Support for Next.js, Vite, and Astro frameworks
- Integration with Cursor IDE for seamless workflow
- Pre-built component library with 40+ sections
- Multi-page project support
- Code preservation during all operations
- Responsive design capabilities
- Dark mode support

### Out of Scope

- Support for frameworks other than Next.js, Vite, and Astro (initially)
- Real-time collaborative editing (multiple users)
- Version control integration (Git operations)
- Database schema editing
- Backend API development
- Custom component creation UI (users create components in code, system imports them)
- Advanced animation timeline editor
- Design system management features
- AI-assisted design modifications (deferred to future phase)
- Deployment integration for hosting platforms (deferred to future phase)

## User Scenarios & Testing

### Scenario 1: First-Time Setup
1. Developer runs setup command
2. System prompts for project path
3. System scans project and imports components
4. Browser opens with visual editor
5. **Acceptance**: Editor displays imported components in sidebar, canvas is ready for editing

### Scenario 2: Visual to Code Sync
1. Developer drags a button block onto canvas
2. Developer positions and styles the button visually
3. System automatically generates code
4. **Acceptance**: After 1 second, corresponding code file contains properly formatted code with semantic Tailwind classes

### Scenario 3: Code to Visual Sync
1. Developer modifies code file externally (changes Tailwind classes)
2. System detects file change
3. **Acceptance**: Within 1 second, canvas updates to reflect code changes, element position/style matches code

### Scenario 4: Multi-Page Editing
1. Developer switches to edit a different page
2. System loads page structure into canvas
3. Developer makes visual changes
4. **Acceptance**: Changes are saved to correct page file, other pages remain unchanged

### Scenario 5: Component Import
1. Developer adds a new component file to project
2. System detects new component
3. **Acceptance**: New component appears in editor sidebar as draggable block within 5 seconds

### Scenario 6: Cursor IDE Integration
1. Developer right-clicks element in editor
2. Selects "Open in Cursor"
3. **Acceptance**: Cursor IDE opens to correct file and line number

### Scenario 7: Code Preservation
1. Developer has custom logic inside a component
2. Developer modifies component styling in visual editor
3. **Acceptance**: Custom logic code remains completely intact, only styling classes are modified

## Technical Design

### Architecture

The system consists of:
- **Frontend Application**: Web-based visual editor running in browser
- **Backend Service**: Handles file operations, code parsing, and synchronization
- **File Watcher**: Monitors project files for external changes
- **Code Parser**: Converts code files into editable visual representation
- **Code Generator**: Converts visual representation back into formatted code
- **Synchronization Layer**: Manages bidirectional updates with conflict resolution

All components run in containerized environments to ensure consistency and portability.

### Data Flow

1. **Visual to Code Flow**:
   - User makes change on canvas → Change debounced (400ms) → Visual state converted to code structure → Code formatted and validated → Written to file

2. **Code to Visual Flow**:
   - File change detected → Conflict check (if concurrent edit detected, apply last-write-wins) → File parsed into structure → Structure converted to visual state → Canvas updated → User sees changes (with conflict indicator if applicable)

3. **Element Tracking**:
   - Each visual element has unique identifier (data-cf-id)
   - Identifiers map between visual representation and code elements
   - Identifiers preserved during all operations

### Code Generation Rules

Following Principles 5 and 7:

1. **Preservation Rules**:
   - Never modify code inside component function bodies
   - Never remove user-defined props or attributes
   - Never change component structure or nesting
   - Preserve all comments and formatting outside modified sections

2. **Styling Rules**:
   - Only modify Tailwind CSS classes on elements
   - Never use inline styles (style={{}})
   - Never use arbitrary Tailwind values (e.g., top-[123px])
   - Use semantic Tailwind utilities (translate-x/y, grid col-start/span, flex order)
   - Automatically choose between grid and flex layouts based on element relationships
   - Support absolute, relative, fixed, and sticky positioning with semantic classes

3. **Positioning Rules**:
   - When positioning is ambiguous, use relative positioning with translate classes
   - Prefer semantic layout utilities over manual positioning
   - Maintain responsive behavior with Tailwind breakpoint classes

## Testing Requirements

Following Principle 3 (Mandatory Testing):

### Unit Tests
- Code parser handles all supported file types (TSX, JSX, TS, JS)
- Code generator produces valid, formatted code
- Element tracking maintains correct mappings
- Tailwind class generation follows semantic rules
- Code preservation logic maintains user code integrity

### Integration Tests
- File watcher detects changes correctly
- Synchronization layer handles concurrent edits
- Component scanner identifies all project components
- Framework detection works for all supported frameworks
- Protocol handlers communicate correctly with Cursor IDE

### E2E Tests (Playwright)
- Complete visual-to-code sync cycle: drag block → verify file update
- Complete code-to-visual sync cycle: modify file → verify canvas update
- Multi-page editing: switch pages → make changes → verify correct files
- Component import: add component → verify appearance in sidebar
- Cursor IDE integration: right-click → verify IDE opens correctly
- Code preservation: modify styled component → verify logic intact
- 20+ positioning scenarios: verify correct Tailwind classes generated

All tests MUST run in Docker containers. Test containers connect to main application containers via docker-compose.

## Configuration

Following Principle 6 (Configuration Externalization):

### Environment Variables
- `CURSORFI_PROJECT_PATH`: Path to target project directory
- `CURSORFI_FRONTEND_PORT`: Port for web frontend (default: non-standard port)
- `CURSORFI_BACKEND_PORT`: Port for backend service (default: non-standard port)
- `CURSORFI_SYNC_DEBOUNCE_MS`: Debounce delay for file writes (default: 400ms)
- `CURSORFI_FILE_WATCH_INTERVAL`: File watching poll interval (if needed)

### Config Files
- `cursorfi.json`: Global configuration file (single file, not in user projects)
  - Project path
  - Framework type (auto-detected, can be overridden)
  - Component scan paths
  - Custom settings

All ports MUST be configurable and MUST NOT use standard ports (80, 8080, 443) by default.

## Dependencies

### Packages
- Frontend framework and UI libraries (as per Principle 2)
- Canvas manipulation library
- Drag-and-drop library
- File watching library
- Code parsing and generation libraries
- State management library
- Backend framework and API libraries
- Testing frameworks and browser automation tools

### Container Requirements
- Base images supporting Bun runtime
- Test containers with browser support for Playwright
- Network configuration for container communication
- Volume mounts for project file access

Specific package versions and container images will be defined in the implementation plan.

## Success Criteria

- [ ] **Functional Completeness**: All 7 functional requirements implemented and working
- [ ] **Synchronization Accuracy**: 100% of visual changes correctly sync to code files within 1 second
- [ ] **Synchronization Accuracy**: 100% of code changes correctly sync to visual canvas within 1 second
- [ ] **Code Preservation**: 100% of user code remains intact after all editor operations
- [ ] **Framework Support**: System successfully works with Next.js, Vite, and Astro test projects
- [ ] **Performance**: Editor responds to user actions within 100ms, file sync completes within 500ms
- [ ] **Component Library**: 40+ pre-built components available, all with dark mode and responsive design
- [ ] **Test Coverage**: All user scenarios pass automated tests in containers
- [ ] **Integration**: Cursor IDE integration works on both macOS and Windows
- [ ] **Reliability**: System handles 100+ component projects without performance issues
- [ ] **Documentation**: Complete setup and usage documentation with examples

## Assumptions

1. Users have Docker and docker-compose installed on their systems
2. Target projects use Tailwind CSS for styling
3. Target projects follow standard directory structures for supported frameworks
4. Users have Cursor IDE installed for integration features
5. Network connectivity exists between remote server (editor) and local machine (IDE) for protocol handlers
6. File system permissions allow reading and writing to project directories
7. Projects use modern JavaScript/TypeScript (ES6+)
8. Users are familiar with basic web development concepts

## Dependencies & Prerequisites

- Docker and docker-compose must be installed
- Target project must exist and be accessible
- Sufficient disk space for container images and project files
- Network access for deployment features (if used)
- Cursor IDE installed for full integration features (optional but recommended)
