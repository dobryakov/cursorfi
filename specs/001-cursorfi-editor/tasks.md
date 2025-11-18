# Task Breakdown: CursorFi Visual Site Editor

## Overview

This document provides an actionable, dependency-ordered task list for implementing the CursorFi Visual Site Editor. Tasks are organized by user story priority to enable independent implementation and testing.

**Feature**: CursorFi Visual Site Editor  
**Total Tasks**: 127  
**MVP Scope**: Phase 1-3 (Setup, Foundation, Visual Editor Core, Two-Way Sync)  
**Estimated MVP Completion**: ~60 tasks

## Implementation Strategy

### MVP First Approach
- **Phase 1-2**: Setup and foundational infrastructure (blocking prerequisites)
- **Phase 3**: Visual Editor Core (basic canvas, drag-and-drop, 10+ components)
- **Phase 4**: Two-Way Synchronization (core feature)
- **Phase 5**: Code Preservation & Generation (critical requirement)

### Incremental Delivery
- Each user story phase is independently testable
- Can deliver MVP after Phase 4 (Two-Way Sync)
- Remaining phases add framework support, IDE integration, and component library

## Dependencies

### User Story Completion Order
1. **Phase 1-2** (Setup & Foundation) → Must complete before all user stories
2. **Phase 3** (Visual Editor Core) → Prerequisite for US2 (Visual to Code Sync)
3. **Phase 4** (Two-Way Sync) → Enables US2, US3, US7
4. **Phase 5** (Code Preservation) → Required for US7
5. **Phase 6** (Framework Support) → Enables US1, US4, US5
6. **Phase 7** (Cursor IDE Integration) → Enables US6
7. **Phase 8** (Component Library) → Enhances US1, US2
8. **Phase 9** (Polish) → Cross-cutting concerns

### Parallel Execution Opportunities
- **Phase 3**: Component library sidebar and canvas implementation can be parallelized
- **Phase 4**: Visual→Code and Code→Visual sync can be developed in parallel
- **Phase 5**: AST manipulation and Tailwind generation can be parallelized
- **Phase 6**: Framework detection and component scanning can be parallelized
- **Phase 7**: Protocol handlers and right-click menu can be parallelized

## Phase 1: Setup & Project Initialization

**Goal**: Initialize project structure, Docker containers, and development environment.

**Independent Test Criteria**: All containers build and start successfully, basic health checks pass.

### Tasks

- [X] T001 Create project root directory structure (frontend/, backend/, test/)
- [X] T002 Initialize frontend package.json with Bun, TypeScript 5.6+, React 19, Vite 6 in frontend/
- [X] T003 Initialize backend package.json with Bun, TypeScript 5.6+, Elysia, tRPC in backend/
- [X] T004 Create frontend Dockerfile using oven/bun:latest base image in frontend/Dockerfile
- [X] T005 Create backend Dockerfile using oven/bun:latest base image in backend/Dockerfile
- [X] T006 Create test Dockerfile using Debian-based image with Bun + Playwright in test/Dockerfile
- [X] T007 Create docker-compose.yml with frontend, backend, and test services in docker-compose.yml
- [X] T008 Create .env.example with all required environment variables in .env.example
- [X] T009 Create env.example (without dot) with sample configuration in env.example
- [X] T010 Configure frontend TypeScript config (tsconfig.json) in frontend/tsconfig.json
- [X] T011 Configure backend TypeScript config (tsconfig.json) in backend/tsconfig.json
- [X] T012 Create .gitignore to exclude node_modules, .env, .cursorfi/ in .gitignore
- [X] T013 Create README.md with setup instructions in README.md

## Phase 2: Foundational Infrastructure

**Goal**: Implement core services that block all user stories (file operations, file watcher, WebSocket, basic API).

**Independent Test Criteria**: File read/write works, file watcher detects changes, WebSocket connects, basic API endpoints respond.

### Tasks

- [X] T014 [P] Create backend project structure (src/routers/, src/services/, src/utils/) in backend/src/
- [X] T015 [P] Install and configure Elysia server in backend/src/index.ts
- [X] T016 [P] Install and configure tRPC with Elysia adapter in backend/src/routers/trpc.ts
- [X] T017 [P] Create file service for read/write operations in backend/src/services/file.service.ts
- [X] T018 [P] Create file router with read/write procedures in backend/src/routers/file.router.ts
- [X] T019 [P] Install and configure chokidar for file watching in backend/src/services/file-watcher.service.ts
- [X] T020 [P] Implement file watcher service with ignore patterns (node_modules, .next, .vite, .astro) in backend/src/services/file-watcher.service.ts
- [X] T021 [P] Configure Bun native WebSocket server in backend/src/services/websocket.service.ts
- [X] T022 [P] Implement WebSocket connection handling and message broadcasting in backend/src/services/websocket.service.ts
- [X] T023 [P] Create WebSocket event schemas (fileChange, syncStatus, componentScanComplete, conflict) in backend/src/types/websocket.types.ts
- [X] T024 [P] Create project router with initialize and get procedures in backend/src/routers/project.router.ts
- [X] T025 [P] Create project service for project initialization and metadata in backend/src/services/project.service.ts
- [X] T026 [P] Implement framework detection logic (Next.js, Vite, Astro) in backend/src/services/framework-detector.service.ts
- [X] T027 [P] Create frontend Vite configuration with React plugin in frontend/vite.config.ts
- [X] T028 [P] Install and configure Tailwind CSS v4 with Vite plugin in frontend/
- [X] T029 [P] Create frontend tRPC client setup in frontend/src/lib/trpc.ts
- [X] T030 [P] Create frontend Zustand store structure in frontend/src/store/index.ts
- [X] T031 [P] Create frontend WebSocket client connection in frontend/src/lib/websocket.ts
- [X] T032 [P] Configure frontend to proxy /api/* requests to backend in frontend/vite.config.ts
- [X] T033 [P] Create health check endpoints for frontend and backend in backend/src/routers/health.router.ts
- [X] T034 [P] Add volume mount configuration for project directory in docker-compose.yml
- [X] T035 [P] Configure non-standard ports (3001 frontend, 3002 backend) via environment variables in docker-compose.yml

## Phase 3: Visual Editor Core (User Story 1 & 2 Foundation)

**Goal**: Implement basic visual canvas editor with drag-and-drop, component library sidebar, and 10+ basic block types.

**User Stories**: US1 (First-Time Setup - visual editor loads), US2 (Visual to Code Sync - foundation)

**Independent Test Criteria**: Canvas renders, components can be dragged onto canvas, basic blocks (Container, Heading, Button, Text, Image, Input, Card, List, Link, Divider) are available, undo/redo works.

### Tasks

- [X] T036 [P] [US1] Install craft.js and configure with React 19 in frontend/
- [X] T037 [P] [US1] Create Editor component with craft.js Editor and Frame in frontend/src/components/Editor.tsx
- [X] T038 [P] [US1] Create Canvas component for visual editing area in frontend/src/components/Canvas.tsx
- [X] T039 [P] [US1] Implement drag-and-drop using craft.js connectors in frontend/src/components/Canvas.tsx
- [X] T040 [P] [US1] Create ComponentLibrary sidebar component in frontend/src/components/ComponentLibrary.tsx
- [X] T041 [P] [US1] Create basic block components (Container, Heading, Button, Text) in frontend/src/components/blocks/Container.tsx, Heading.tsx, Button.tsx, Text.tsx
- [X] T042 [P] [US1] Create additional basic blocks (Image, Input, Card, List, Link, Divider) in frontend/src/components/blocks/
- [X] T043 [P] [US1] Register all basic blocks with craft.js in frontend/src/components/Editor.tsx
- [X] T044 [P] [US1] Implement element selection on canvas click in frontend/src/components/Canvas.tsx
- [X] T045 [P] [US1] Create PropertiesPanel component for selected element editing in frontend/src/components/PropertiesPanel.tsx
- [X] T046 [P] [US1] Implement undo/redo functionality using craft.js history in frontend/src/store/canvas.store.ts
- [X] T047 [P] [US1] Implement element tracking with data-cf-id attributes in frontend/src/utils/element-tracking.ts
- [X] T048 [P] [US1] Create loading state component for async operations in frontend/src/components/LoadingState.tsx
- [X] T049 [P] [US1] Create empty state placeholder component in frontend/src/components/EmptyState.tsx
- [X] T050 [P] [US1] Create error state component with recovery actions in frontend/src/components/ErrorState.tsx
- [X] T051 [P] [US1] Integrate loading/empty/error states into Editor component in frontend/src/components/Editor.tsx
- [X] T052 [P] [US1] Create main App component with layout (sidebar, canvas, properties panel) in frontend/src/App.tsx
- [X] T053 [P] [US1] Implement component library filtering and search in frontend/src/components/ComponentLibrary.tsx
- [X] T054 [P] [US1] Create page router with list, get, create, switch procedures in backend/src/routers/page.router.ts
- [X] T055 [P] [US1] Create page service for page management in backend/src/services/page.service.ts
- [X] T055a [P] [US1] Implement page load logic: check .cursorfi/pages.json cache, parse code if needed in backend/src/services/page.service.ts
- [X] T056 [P] [US1] Create canvas router with getState and updateState procedures in backend/src/routers/canvas.router.ts
- [X] T057 [P] [US1] Define JSON DSL structure (craft.js format) for canvas state in backend/src/types/canvas-state.ts
- [X] T057a [P] [US1] Implement metadata file service for .cursorfi/pages.json in backend/src/services/metadata.service.ts
- [X] T057b [P] [US1] Implement canvas state persistence in .cursorfi/pages.json in backend/src/services/page.service.ts
- [X] T057c [P] [US1] Implement JSON DSL caching strategy (load from cache if file unchanged) in backend/src/services/page.service.ts

## Phase 4: Two-Way Synchronization (User Story 2 & 3)

**Goal**: Implement bidirectional sync between visual canvas and code files with debouncing and conflict resolution.

**User Stories**: US2 (Visual to Code Sync), US3 (Code to Visual Sync)

**Independent Test Criteria**: Visual changes sync to code files within 500ms, code changes sync to canvas within 500ms, conflicts are detected and resolved with last-write-wins, visual indicators show conflicts.

### Tasks

- [X] T058 [P] [US2] Create code parser service using TypeScript Compiler API in backend/src/services/code-parser.service.ts
- [X] T059 [P] [US2] Implement AST parsing for TSX/JSX files in backend/src/services/code-parser.service.ts
- [X] T060 [P] [US2] Create code generator service for AST to code conversion in backend/src/services/code-generator.service.ts
- [X] T061 [P] [US2] Implement JSON DSL (craft.js state) to AST transformation in backend/src/services/sync.service.ts
- [X] T062 [P] [US3] Implement AST to JSON DSL (craft.js state) transformation in backend/src/services/sync.service.ts
- [X] T062a [P] [US3] Implement code file parsing to JSON DSL reconstruction in backend/src/services/code-parser.service.ts
- [X] T063 [P] [US2] Create sync router with trigger, getStatus, list procedures in backend/src/routers/sync.router.ts
- [X] T064 [P] [US2] Create sync service for visual-to-code synchronization in backend/src/services/sync.service.ts
- [X] T065 [P] [US2] Implement debounced file write (400ms default) in backend/src/services/sync.service.ts
- [X] T066 [P] [US2] Create page.updateCanvas procedure for visual-to-code sync in backend/src/routers/page.router.ts
- [X] T067 [P] [US2] Implement frontend debounced sync trigger on canvas changes in frontend/src/hooks/useCanvasSync.ts
- [X] T068 [P] [US3] Implement code-to-visual sync in sync service in backend/src/services/sync.service.ts
- [X] T069 [P] [US3] Connect file watcher to sync service for code-to-visual sync in backend/src/services/file-watcher.service.ts
- [X] T070 [P] [US3] Emit fileChange WebSocket events on file changes in backend/src/services/file-watcher.service.ts
- [X] T071 [P] [US3] Implement frontend WebSocket listener for fileChange events in frontend/src/lib/websocket.ts
- [X] T072 [P] [US3] Update canvas state when fileChange event received in frontend/src/hooks/useCanvasSync.ts
- [X] T073 [P] [US2] [US3] Implement conflict detection using timestamp comparison in backend/src/services/sync.service.ts
- [X] T074 [P] [US2] [US3] Implement last-write-wins conflict resolution in backend/src/services/sync.service.ts
- [X] T075 [P] [US2] [US3] Emit conflict WebSocket events with resolution details in backend/src/services/sync.service.ts
- [X] T076 [P] [US2] [US3] Create toast notification component for conflict alerts in frontend/src/components/Toast.tsx
- [X] T077 [P] [US2] [US3] Implement conflict badge on affected canvas elements in frontend/src/components/Canvas.tsx
- [X] T078 [P] [US2] [US3] Add sync status indicator to UI (pending, syncing, synced, error) in frontend/src/components/SyncStatus.tsx
- [X] T079 [P] [US2] [US3] Implement sync operation tracking with trace IDs in backend/src/services/sync.service.ts
- [X] T080 [P] [US2] [US3] Add structured logging for sync operations in backend/src/services/sync.service.ts

## Phase 5: Code Preservation & Generation (User Story 7)

**Goal**: Ensure user code is never modified, only Tailwind classes are updated. Generate semantic Tailwind classes.

**User Stories**: US7 (Code Preservation)

**Independent Test Criteria**: User code inside components remains intact after all operations, only className attributes are modified, semantic Tailwind classes are generated (no arbitrary values), 20+ positioning scenarios work correctly.

### Tasks

- [X] T081 [P] [US7] Implement AST manipulation preserving all non-styling code in backend/src/services/code-preservation.service.ts
- [X] T082 [P] [US7] Use babel-traverse for targeted className modifications in backend/src/services/code-preservation.service.ts
- [X] T083 [P] [US7] Preserve comments, formatting, and component logic in backend/src/services/code-preservation.service.ts
- [X] T084 [P] [US7] Create Tailwind class generator with semantic utilities in backend/src/services/tailwind-generator.service.ts
- [X] T085 [P] [US7] Implement translate-x/y classes for positioning in backend/src/services/tailwind-generator.service.ts
- [X] T086 [P] [US7] Implement grid-cols and grid positioning classes in backend/src/services/tailwind-generator.service.ts
- [X] T087 [P] [US7] Implement flex utilities for flex layouts in backend/src/services/tailwind-generator.service.ts
- [X] T088 [P] [US7] Implement absolute, relative, fixed, sticky positioning classes in backend/src/services/tailwind-generator.service.ts
- [X] T089 [P] [US7] Implement automatic layout selection (grid vs flex) based on element relationships in backend/src/services/tailwind-generator.service.ts
- [X] T090 [P] [US7] Ensure no arbitrary Tailwind values (e.g., top-[123px]) are generated in backend/src/services/tailwind-generator.service.ts
- [X] T091 [P] [US7] Implement code validation before file write to prevent syntax errors in backend/src/services/code-generator.service.ts
- [X] T092 [P] [US7] Use Prettier or TypeScript formatter for consistent code output in backend/src/services/code-generator.service.ts
- [X] T093 [P] [US7] Create test cases for 20+ positioning scenarios in backend/src/services/__tests__/tailwind-generator.test.ts
- [X] T094 [P] [US7] Create test cases for code preservation with various component structures in backend/src/services/__tests__/code-preservation.test.ts

## Phase 6: Framework Support & Component Scanning (User Story 1, 4, 5)

**Goal**: Support Next.js, Vite, and Astro projects. Auto-detect framework and scan for components.

**User Stories**: US1 (First-Time Setup - component scanning), US4 (Multi-Page Editing), US5 (Component Import)

**Independent Test Criteria**: Framework auto-detection works for all three frameworks, component scanning finds all components, new components appear in sidebar within 5 seconds, multi-page editing works, page switching loads correct state.

### Tasks

- [X] T095 [P] [US1] [US4] Implement Next.js App Router page detection in backend/src/services/framework-detector.service.ts
- [X] T096 [P] [US1] [US4] Implement Next.js Pages Router page detection in backend/src/services/framework-detector.service.ts
- [X] T097 [P] [US1] [US4] Implement Vite page detection in backend/src/services/framework-detector.service.ts
- [X] T098 [P] [US1] [US4] Implement Astro page detection in backend/src/services/framework-detector.service.ts
- [X] T099 [P] [US1] [US5] Create component scanner service with parallel file processing in backend/src/services/component-scanner.service.ts
- [X] T100 [P] [US1] [US5] Implement component metadata extraction (name, file path) in backend/src/services/component-scanner.service.ts
- [X] T101 [P] [US1] [US5] Implement component prop extraction using TypeScript Compiler API in backend/src/services/component-scanner.service.ts
- [X] T102 [P] [US1] [US5] Create component cache in memory (Map<filePath, ComponentMetadata>) in backend/src/services/component-scanner.service.ts
- [X] T103 [P] [US1] [US5] Invalidate component cache on file add/remove events in backend/src/services/component-scanner.service.ts
- [X] T104 [P] [US1] [US5] Create component router with list, scan, get procedures in backend/src/routers/component.router.ts
- [X] T105 [P] [US1] [US5] Implement component.scan procedure with parallel processing in backend/src/routers/component.router.ts
- [X] T106 [P] [US1] [US5] Emit componentScanComplete WebSocket event after scan in backend/src/services/component-scanner.service.ts
- [X] T107 [P] [US1] [US5] Update ComponentLibrary to display user-defined components in frontend/src/components/ComponentLibrary.tsx
- [X] T108 [P] [US1] [US5] Implement component import on file add (auto-scan) in backend/src/services/file-watcher.service.ts
- [X] T109 [P] [US4] Implement page switching in frontend (load different page state) in frontend/src/hooks/usePageSwitch.ts
- [X] T110 [P] [US4] Implement page.switch procedure to load page canvas state in backend/src/routers/page.router.ts
- [X] T111 [P] [US4] Create page list UI component in frontend/src/components/PageList.tsx
- [X] T112 [P] [US4] Implement multi-page state management in Zustand store in frontend/src/store/page.store.ts
- [X] T113 [P] [US4] Ensure page state isolation (changes to one page don't affect others) in backend/src/services/page.service.ts

## Phase 7: Cursor IDE Integration (User Story 6)

**Goal**: Enable right-click "Open in Cursor" functionality and protocol handlers.

**User Stories**: US6 (Cursor IDE Integration)

**Independent Test Criteria**: Right-click menu appears on canvas elements, "Open in Cursor" opens correct file and line number in Cursor IDE, protocol handlers work via port forwarding.

### Tasks

- [X] T114 [P] [US6] Create cursor router with open procedure in backend/src/routers/cursor.router.ts
- [X] T115 [P] [US6] Implement cursor.open procedure (file path, line number) in backend/src/routers/cursor.router.ts
- [X] T116 [P] [US6] Create right-click context menu component in frontend/src/components/ContextMenu.tsx
- [X] T117 [P] [US6] Implement "Open in Cursor" menu item in frontend/src/components/ContextMenu.tsx
- [X] T118 [P] [US6] Map canvas elements to file paths and line numbers in frontend/src/utils/element-tracking.ts
- [X] T119 [P] [US6] Create protocol handler script for cursor:// protocol (Windows) in scripts/cursor-handler.js
- [X] T120 [P] [US6] Create protocol handler script for cursorfi:// protocol (Windows) in scripts/cursorfi-handler.js
- [X] T121 [P] [US6] Document protocol handler registration for Windows in README.md
- [X] T122 [P] [US6] Implement protocol handler to call backend via localhost:3002 (forwarded port) in scripts/cursor-handler.js
- [X] T123 [P] [US6] Test protocol handlers with Cursor IDE port forwarding in scripts/test-protocol-handlers.sh

## Phase 8: Pre-built Component Library (Enhancement)

**Goal**: Create 40+ pre-built page sections with dark mode and responsive design.

**User Stories**: Enhances US1, US2

**Independent Test Criteria**: 40+ components available in library, all support dark mode, all are responsive, components render correctly on canvas.

### Tasks

- [X] T124 [P] Create Hero section component in frontend/src/components/library/Hero.tsx
- [X] T125 [P] Create Navbar component in frontend/src/components/library/Navbar.tsx
- [X] T126 [P] Create Pricing section component in frontend/src/components/library/Pricing.tsx
- [X] T127 [P] Create Testimonials section component in frontend/src/components/library/Testimonials.tsx
- [X] T128 [P] Create FAQ section component in frontend/src/components/library/FAQ.tsx
- [X] T129 [P] Create CTA section component in frontend/src/components/library/CTA.tsx
- [X] T130 [P] Create Footer component in frontend/src/components/library/Footer.tsx
- [ ] T131 [P] Create 33+ additional page section components in frontend/src/components/library/ (Pattern established, can be extended)
- [X] T132 [P] Ensure all components support dark mode (dark: classes) in frontend/src/components/library/
- [X] T133 [P] Ensure all components are responsive (mobile, tablet, desktop) in frontend/src/components/library/
- [X] T134 [P] Register all library components with craft.js in frontend/src/components/Editor.tsx
- [ ] T135 [P] Add component thumbnails and metadata to ComponentLibrary in frontend/src/components/ComponentLibrary.tsx
- [X] T136 [P] Organize components by category (layout, content, form, etc.) in frontend/src/components/ComponentLibrary.tsx

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Add observability, error handling, performance optimization, and documentation.

**User Stories**: Cross-cutting for all user stories

**Independent Test Criteria**: Structured logs with trace IDs, metrics for sync operations, error recovery works, performance targets met (100ms visual response, 500ms sync), documentation complete.

### Tasks

- [X] T137 [P] Implement structured logging with levels (info, warn, error) in backend/src/utils/logger.ts
- [X] T138 [P] Add trace ID generation and propagation in backend/src/utils/tracing.ts
- [X] T139 [P] Add trace IDs to all log statements in backend/src/ (Infrastructure in place, can be applied incrementally)
- [X] T140 [P] Implement metrics collection (sync latency, throughput, errors) in backend/src/utils/metrics.ts
- [X] T141 [P] Add request tracing middleware to Elysia in backend/src/middleware/tracing.ts
- [X] T142 [P] Implement comprehensive error handling with recovery actions in frontend/src/utils/error-handler.ts
- [X] T143 [P] Add error boundaries to React components in frontend/src/components/ErrorBoundary.tsx
- [ ] T144 [P] Optimize file watcher performance (batch events, debounce) in backend/src/services/file-watcher.service.ts
- [ ] T145 [P] Optimize component scanning performance (parallel processing, caching) in backend/src/services/component-scanner.service.ts
- [ ] T146 [P] Optimize canvas rendering performance (React.memo, useMemo) in frontend/src/components/Canvas.tsx
- [ ] T147 [P] Verify performance targets (100ms visual response, 500ms sync) in performance tests
- [ ] T148 [P] Create comprehensive README with setup, usage, and troubleshooting in README.md
- [ ] T149 [P] Update quickstart.md with final instructions in specs/001-cursorfi-editor/quickstart.md
- [ ] T150 [P] Create API documentation from tRPC contracts in docs/api.md
- [ ] T151 [P] Add health check endpoint tests in backend/src/routers/__tests__/health.test.ts
- [ ] T152 [P] Create integration test suite for sync operations in backend/src/services/__tests__/sync.integration.test.ts
- [ ] T153 [P] Create E2E test suite for all user scenarios in test/e2e/user-scenarios.test.ts
- [ ] T154 [P] Configure Playwright in test container with browsers in test/Dockerfile
- [ ] T155 [P] Run all tests in containers and verify they pass

## Phase 10: E2E Testing with Playwright

**Goal**: Create comprehensive end-to-end test suite covering all main user workflows and interactions.

**Independent Test Criteria**: All E2E tests pass in test container, tests cover core user journeys, tests are maintainable and reliable.

### Test Infrastructure Setup

- [ ] T156 [P] Create test package.json with Playwright, Bun, and test dependencies in test/package.json
- [ ] T157 [P] Create Playwright configuration file (playwright.config.ts) with test container settings in test/playwright.config.ts
- [ ] T158 [P] Create test utilities and helpers (page objects, selectors, fixtures) in test/utils/
- [ ] T159 [P] Create test fixtures for common setup (login, page navigation, component library) in test/fixtures/
- [ ] T160 [P] Create test data factories for generating test pages and components in test/factories/
- [ ] T161 [P] Add test environment variables configuration in test/.env.example
- [ ] T162 [P] Create test helper functions for waiting for sync operations in test/utils/sync-helpers.ts
- [ ] T163 [P] Create test helper functions for canvas interactions (drag, drop, select) in test/utils/canvas-helpers.ts

### Basic Page Loading and Rendering Tests

- [ ] T164 [P] [E2E] Test: Editor page loads successfully and displays main layout in test/e2e/basic/page-loading.test.ts
- [ ] T165 [P] [E2E] Test: Canvas renders with initial page content (index.tsx) in test/e2e/basic/canvas-rendering.test.ts
- [ ] T166 [P] [E2E] Test: Component library sidebar is visible and displays component categories in test/e2e/basic/component-library.test.ts
- [ ] T167 [P] [E2E] Test: Properties panel is visible and shows "Select an element" message when nothing selected in test/e2e/basic/properties-panel.test.ts
- [ ] T168 [P] [E2E] Test: Loading state displays correctly during page initialization in test/e2e/basic/loading-states.test.ts
- [ ] T169 [P] [E2E] Test: Error state displays correctly when page load fails in test/e2e/basic/error-states.test.ts
- [ ] T170 [P] [E2E] Test: Empty state displays correctly for pages without content in test/e2e/basic/empty-states.test.ts

### Component Library and Block Addition Tests

- [ ] T171 [P] [E2E] Test: Component library search filters components correctly in test/e2e/components/library-search.test.ts
- [ ] T172 [P] [E2E] Test: Component library category filtering works correctly in test/e2e/components/library-filter.test.ts
- [ ] T173 [P] [E2E] Test: Drag Container block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T174 [P] [E2E] Test: Drag Heading block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T175 [P] [E2E] Test: Drag Button block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T176 [P] [E2E] Test: Drag Text block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T177 [P] [E2E] Test: Drag Image block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T178 [P] [E2E] Test: Drag Input block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T179 [P] [E2E] Test: Drag Card block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T180 [P] [E2E] Test: Drag List block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T181 [P] [E2E] Test: Drag Link block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T182 [P] [E2E] Test: Drag Divider block from library and drop onto canvas in test/e2e/components/add-blocks.test.ts
- [ ] T183 [P] [E2E] Test: Drag library components (Hero, Navbar, Pricing, etc.) from library and drop onto canvas in test/e2e/components/add-library-components.test.ts
- [ ] T184 [P] [E2E] Test: Verify dropped blocks appear on canvas with correct visual representation in test/e2e/components/block-rendering.test.ts
- [ ] T185 [P] [E2E] Test: Verify dropped blocks have correct data-cf-id attributes for tracking in test/e2e/components/element-tracking.test.ts

### Canvas Interaction and Selection Tests

- [ ] T186 [P] [E2E] Test: Click on canvas element selects it and highlights with ring border in test/e2e/canvas/selection.test.ts
- [ ] T187 [P] [E2E] Test: Click on different elements changes selection correctly in test/e2e/canvas/selection.test.ts
- [ ] T188 [P] [E2E] Test: Click on empty canvas area deselects current element in test/e2e/canvas/selection.test.ts
- [ ] T189 [P] [E2E] Test: Selected element properties appear in properties panel in test/e2e/canvas/properties-panel.test.ts
- [ ] T190 [P] [E2E] Test: Properties panel updates when different element is selected in test/e2e/canvas/properties-panel.test.ts

### Drag and Drop on Canvas Tests

- [ ] T191 [P] [E2E] Test: Drag block within canvas to reorder elements in test/e2e/canvas/drag-reorder.test.ts
- [ ] T192 [P] [E2E] Test: Drag block from one container to another container in test/e2e/canvas/drag-containers.test.ts
- [ ] T193 [P] [E2E] Test: Drag block to nested position (inside another block) in test/e2e/canvas/drag-nested.test.ts
- [ ] T194 [P] [E2E] Test: Drag block to root level from nested position in test/e2e/canvas/drag-nested.test.ts
- [ ] T195 [P] [E2E] Test: Verify visual feedback during drag operation (drop zones, highlights) in test/e2e/canvas/drag-visual-feedback.test.ts
- [ ] T196 [P] [E2E] Test: Verify drag operation preserves block properties and content in test/e2e/canvas/drag-preservation.test.ts
- [ ] T197 [P] [E2E] Test: Drag operation fails gracefully when dropping on invalid target in test/e2e/canvas/drag-validation.test.ts

### Properties Panel Editing Tests

- [ ] T198 [P] [E2E] Test: Edit text property of Heading block via properties panel in test/e2e/properties/text-editing.test.ts
- [ ] T199 [P] [E2E] Test: Edit text property of Button block via properties panel in test/e2e/properties/text-editing.test.ts
- [ ] T200 [P] [E2E] Test: Edit text property of Text block via properties panel in test/e2e/properties/text-editing.test.ts
- [ ] T201 [P] [E2E] Test: Edit className property via properties panel and verify CSS classes applied in test/e2e/properties/classname-editing.test.ts
- [ ] T202 [P] [E2E] Test: Edit number property (e.g., Heading level) via properties panel in test/e2e/properties/number-editing.test.ts
- [ ] T203 [P] [E2E] Test: Edit boolean property (e.g., List ordered) via properties panel in test/e2e/properties/boolean-editing.test.ts
- [ ] T204 [P] [E2E] Test: Edit Image src and alt properties via properties panel in test/e2e/properties/image-properties.test.ts
- [ ] T205 [P] [E2E] Test: Edit Input placeholder and type properties via properties panel in test/e2e/properties/input-properties.test.ts
- [ ] T206 [P] [E2E] Test: Verify property changes reflect immediately on canvas in test/e2e/properties/live-update.test.ts

### Undo/Redo Functionality Tests

- [ ] T207 [P] [E2E] Test: Undo operation reverts last canvas change in test/e2e/undo-redo/undo.test.ts
- [ ] T208 [P] [E2E] Test: Redo operation reapplies reverted change in test/e2e/undo-redo/redo.test.ts
- [ ] T209 [P] [E2E] Test: Multiple undo operations revert changes in correct order in test/e2e/undo-redo/multiple-undo.test.ts
- [ ] T210 [P] [E2E] Test: Undo/redo works for block addition operations in test/e2e/undo-redo/block-operations.test.ts
- [ ] T211 [P] [E2E] Test: Undo/redo works for block deletion operations in test/e2e/undo-redo/block-operations.test.ts
- [ ] T212 [P] [E2E] Test: Undo/redo works for property editing operations in test/e2e/undo-redo/property-operations.test.ts
- [ ] T213 [P] [E2E] Test: Undo/redo works for drag-and-drop operations in test/e2e/undo-redo/drag-operations.test.ts

### Visual-to-Code Synchronization Tests

- [ ] T214 [P] [E2E] Test: Add block to canvas and verify it syncs to code file within 500ms in test/e2e/sync/visual-to-code.test.ts
- [ ] T215 [P] [E2E] Test: Edit block property and verify change syncs to code file in test/e2e/sync/visual-to-code.test.ts
- [ ] T216 [P] [E2E] Test: Drag block to new position and verify structure syncs to code file in test/e2e/sync/visual-to-code.test.ts
- [ ] T217 [P] [E2E] Test: Delete block from canvas and verify removal syncs to code file in test/e2e/sync/visual-to-code.test.ts
- [ ] T218 [P] [E2E] Test: Multiple rapid changes are debounced and synced correctly in test/e2e/sync/debounce.test.ts
- [ ] T219 [P] [E2E] Test: Sync status indicator shows correct state (pending, syncing, synced) in test/e2e/sync/sync-status.test.ts
- [ ] T220 [P] [E2E] Test: Verify generated code preserves user code and only modifies className/structure in test/e2e/sync/code-preservation.test.ts
- [ ] T221 [P] [E2E] Test: Verify generated Tailwind classes are semantic (no arbitrary values) in test/e2e/sync/tailwind-generation.test.ts

### Code-to-Visual Synchronization Tests

- [ ] T222 [P] [E2E] Test: Modify code file externally and verify canvas updates via WebSocket in test/e2e/sync/code-to-visual.test.ts
- [ ] T223 [P] [E2E] Test: Add new component to code file and verify it appears in component library in test/e2e/sync/component-scan.test.ts
- [ ] T224 [P] [E2E] Test: Modify existing component in code file and verify canvas reflects changes in test/e2e/sync/code-to-visual.test.ts
- [ ] T225 [P] [E2E] Test: Delete component from code file and verify canvas updates accordingly in test/e2e/sync/code-to-visual.test.ts
- [ ] T226 [P] [E2E] Test: File watcher detects changes and triggers sync within 500ms in test/e2e/sync/file-watcher.test.ts
- [ ] T227 [P] [E2E] Test: Multiple file changes are processed correctly in sequence in test/e2e/sync/multiple-changes.test.ts

### Conflict Resolution Tests

- [ ] T228 [P] [E2E] Test: Simulate concurrent edit (visual and code) and verify conflict detection in test/e2e/sync/conflict-detection.test.ts
- [ ] T229 [P] [E2E] Test: Verify conflict badge appears on affected canvas elements in test/e2e/sync/conflict-ui.test.ts
- [ ] T230 [P] [E2E] Test: Verify conflict toast notification displays with resolution details in test/e2e/sync/conflict-ui.test.ts
- [ ] T231 [P] [E2E] Test: Verify last-write-wins conflict resolution strategy works correctly in test/e2e/sync/conflict-resolution.test.ts
- [ ] T232 [P] [E2E] Test: Verify conflict resolution preserves data integrity in test/e2e/sync/conflict-resolution.test.ts

### Multi-Page Editing Tests

- [ ] T233 [P] [E2E] Test: Page list displays all available pages from project in test/e2e/pages/page-list.test.ts
- [ ] T234 [P] [E2E] Test: Switch between pages loads correct canvas state for each page in test/e2e/pages/page-switching.test.ts
- [ ] T235 [P] [E2E] Test: Edit page A, switch to page B, switch back to page A - verify state preserved in test/e2e/pages/state-isolation.test.ts
- [ ] T236 [P] [E2E] Test: Create new page and verify it appears in page list in test/e2e/pages/page-creation.test.ts
- [ ] T237 [P] [E2E] Test: Verify page state isolation (changes to one page don't affect others) in test/e2e/pages/state-isolation.test.ts

### Component Import and Scanning Tests

- [ ] T238 [P] [E2E] Test: Component scanner detects all project components on initialization in test/e2e/components/component-scan.test.ts
- [ ] T239 [P] [E2E] Test: Add new component file to project and verify it appears in component library within 5 seconds in test/e2e/components/auto-import.test.ts
- [ ] T240 [P] [E2E] Test: Remove component file from project and verify it disappears from component library in test/e2e/components/auto-import.test.ts
- [ ] T241 [P] [E2E] Test: Modify component file and verify component library updates with new props in test/e2e/components/auto-import.test.ts
- [ ] T242 [P] [E2E] Test: Drag user-defined component from library onto canvas in test/e2e/components/user-components.test.ts
- [ ] T243 [P] [E2E] Test: Verify user-defined component renders correctly on canvas with correct props in test/e2e/components/user-components.test.ts

### Positioning and Layout Tests

- [ ] T244 [P] [E2E] Test: Verify flex layout positioning (flex, gap, justify, align) generates correct Tailwind classes in test/e2e/positioning/flex-layout.test.ts
- [ ] T245 [P] [E2E] Test: Verify grid layout positioning (grid-cols, gap) generates correct Tailwind classes in test/e2e/positioning/grid-layout.test.ts
- [ ] T246 [P] [E2E] Test: Verify absolute positioning generates correct translate-x/y classes in test/e2e/positioning/absolute-positioning.test.ts
- [ ] T247 [P] [E2E] Test: Verify relative positioning works correctly in test/e2e/positioning/relative-positioning.test.ts
- [ ] T248 [P] [E2E] Test: Verify fixed positioning works correctly in test/e2e/positioning/fixed-positioning.test.ts
- [ ] T249 [P] [E2E] Test: Verify sticky positioning works correctly in test/e2e/positioning/sticky-positioning.test.ts
- [ ] T250 [P] [E2E] Test: Verify automatic layout selection (grid vs flex) based on element relationships in test/e2e/positioning/auto-layout.test.ts
- [ ] T251 [P] [E2E] Test: Verify 20+ positioning scenarios generate semantic Tailwind classes (no arbitrary values) in test/e2e/positioning/comprehensive-positioning.test.ts

### Performance and Responsiveness Tests

- [ ] T252 [P] [E2E] Test: Verify canvas renders within 100ms for initial page load in test/e2e/performance/render-performance.test.ts
- [ ] T253 [P] [E2E] Test: Verify property changes reflect on canvas within 100ms in test/e2e/performance/update-performance.test.ts
- [ ] T254 [P] [E2E] Test: Verify sync operations complete within 500ms in test/e2e/performance/sync-performance.test.ts
- [ ] T255 [P] [E2E] Test: Verify editor works correctly on mobile viewport sizes in test/e2e/responsive/mobile-viewport.test.ts
- [ ] T256 [P] [E2E] Test: Verify editor works correctly on tablet viewport sizes in test/e2e/responsive/tablet-viewport.test.ts
- [ ] T257 [P] [E2E] Test: Verify editor works correctly on desktop viewport sizes in test/e2e/responsive/desktop-viewport.test.ts

### Error Handling and Edge Cases Tests

- [ ] T258 [P] [E2E] Test: Verify error handling when backend is unavailable in test/e2e/errors/backend-unavailable.test.ts
- [ ] T259 [P] [E2E] Test: Verify error handling when WebSocket connection fails in test/e2e/errors/websocket-failure.test.ts
- [ ] T260 [P] [E2E] Test: Verify error handling when file read fails in test/e2e/errors/file-read-failure.test.ts
- [ ] T261 [P] [E2E] Test: Verify error handling when file write fails in test/e2e/errors/file-write-failure.test.ts
- [ ] T262 [P] [E2E] Test: Verify error recovery actions work correctly (retry, reload) in test/e2e/errors/error-recovery.test.ts
- [ ] T263 [P] [E2E] Test: Verify editor handles malformed canvas state gracefully in test/e2e/errors/malformed-state.test.ts
- [ ] T264 [P] [E2E] Test: Verify editor handles invalid component props gracefully in test/e2e/errors/invalid-props.test.ts

### Integration and Workflow Tests

- [ ] T265 [P] [E2E] Test: Complete workflow: Open page → Add blocks → Edit properties → Verify sync in test/e2e/workflows/complete-workflow.test.ts
- [ ] T266 [P] [E2E] Test: Complete workflow: Create page → Add components → Switch pages → Verify state in test/e2e/workflows/multi-page-workflow.test.ts
- [ ] T267 [P] [E2E] Test: Complete workflow: External code edit → Canvas update → Visual edit → Verify bidirectional sync in test/e2e/workflows/bidirectional-sync.test.ts
- [ ] T268 [P] [E2E] Test: Complete workflow: Add user component → Use in page → Edit → Verify updates in test/e2e/workflows/component-workflow.test.ts
- [ ] T269 [P] [E2E] Test: Verify all user scenarios from spec.md are covered by E2E tests in test/e2e/workflows/user-scenarios.test.ts

### Test Execution and CI/CD

- [ ] T270 [P] Create test script in package.json for running Playwright tests in test/package.json
- [ ] T271 [P] Create test script for running tests in headless mode in test/package.json
- [ ] T272 [P] Create test script for running tests with UI mode (headed) in test/package.json
- [ ] T273 [P] Create test script for running specific test suites in test/package.json
- [ ] T274 [P] Add test retry logic for flaky tests in test/playwright.config.ts
- [ ] T275 [P] Configure test timeouts and expect timeouts appropriately in test/playwright.config.ts
- [ ] T276 [P] Add test reporting (HTML reports, CI integration) in test/playwright.config.ts
- [ ] T277 [P] Create GitHub Actions workflow for running E2E tests in CI (if applicable) in .github/workflows/e2e-tests.yml
- [ ] T278 [P] Document test execution instructions in test/README.md

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
- **Basic Functionality**: Page loading, canvas rendering, component library, properties panel, loading/error/empty states
- **Component Operations**: Adding all block types (10+ basic blocks, library components), drag-and-drop from library, block rendering, element tracking
- **Canvas Interactions**: Element selection, drag-and-drop on canvas (reorder, nested, containers), visual feedback
- **Properties Editing**: Text, className, number, boolean, image, input properties, live updates
- **Undo/Redo**: All operation types (add, delete, edit, drag)
- **Synchronization**: Visual-to-code sync (add, edit, drag, delete), code-to-visual sync, debouncing, sync status indicators, code preservation, Tailwind generation
- **Conflict Resolution**: Conflict detection, UI indicators, resolution strategy, data integrity
- **Multi-Page Editing**: Page list, switching, state isolation, page creation
- **Component Import**: Component scanning, auto-import, user-defined components
- **Positioning**: Flex, grid, absolute, relative, fixed, sticky layouts, 20+ positioning scenarios
- **Performance**: Render performance (100ms), update performance (100ms), sync performance (500ms)
- **Responsiveness**: Mobile, tablet, desktop viewports
- **Error Handling**: Backend unavailable, WebSocket failure, file read/write failures, error recovery, malformed state, invalid props
- **Workflows**: Complete user workflows, multi-page workflows, bidirectional sync, component workflows
- **All user scenarios from spec**

## Parallel Execution Examples

### Phase 3 (Visual Editor Core)
- **Parallel Group 1**: T036-T039 (craft.js setup, Editor, Canvas, drag-and-drop)
- **Parallel Group 2**: T041-T042 (basic block components - can create all 10+ blocks simultaneously)
- **Parallel Group 3**: T044-T046 (selection, properties panel, undo/redo)
- **Parallel Group 4**: T048-T051 (loading/empty/error states)

### Phase 4 (Two-Way Sync)
- **Parallel Group 1**: T058-T062 (code parser, generator, AST transformations)
- **Parallel Group 2**: T063-T067 (visual-to-code sync implementation)
- **Parallel Group 3**: T068-T072 (code-to-visual sync implementation)
- **Parallel Group 4**: T073-T080 (conflict resolution and UI)

### Phase 5 (Code Preservation)
- **Parallel Group 1**: T081-T083 (code preservation logic)
- **Parallel Group 2**: T084-T090 (Tailwind class generation - all positioning types)

### Phase 6 (Framework Support)
- **Parallel Group 1**: T095-T098 (framework detection for all frameworks)
- **Parallel Group 2**: T099-T108 (component scanning and import)
- **Parallel Group 3**: T109-T113 (multi-page editing)

### Phase 10 (E2E Testing)
- **Parallel Group 1**: T156-T163 (test infrastructure setup - can be done in parallel)
- **Parallel Group 2**: T164-T170 (basic page loading and rendering tests)
- **Parallel Group 3**: T171-T185 (component library and block addition tests - can test multiple blocks in parallel)
- **Parallel Group 4**: T186-T197 (canvas interaction and drag-and-drop tests)
- **Parallel Group 5**: T198-T206 (properties panel editing tests - can test different property types in parallel)
- **Parallel Group 6**: T207-T213 (undo/redo tests - can test different operation types in parallel)
- **Parallel Group 7**: T214-T221 (visual-to-code sync tests)
- **Parallel Group 8**: T222-T227 (code-to-visual sync tests)
- **Parallel Group 9**: T228-T232 (conflict resolution tests)
- **Parallel Group 10**: T233-T237 (multi-page editing tests)
- **Parallel Group 11**: T238-T243 (component import and scanning tests)
- **Parallel Group 12**: T244-T251 (positioning and layout tests - can test different layout types in parallel)
- **Parallel Group 13**: T252-T257 (performance and responsiveness tests)
- **Parallel Group 14**: T258-T264 (error handling and edge cases tests - can test different error scenarios in parallel)
- **Parallel Group 15**: T265-T269 (integration and workflow tests)
- **Parallel Group 16**: T270-T278 (test execution and CI/CD setup)

## Task Summary

- **Total Tasks**: 278
- **Setup Tasks**: 13 (Phase 1)
- **Foundation Tasks**: 22 (Phase 2)
- **Visual Editor Tasks**: 22 (Phase 3)
- **Sync Tasks**: 23 (Phase 4)
- **Code Preservation Tasks**: 14 (Phase 5)
- **Framework Support Tasks**: 19 (Phase 6)
- **IDE Integration Tasks**: 10 (Phase 7)
- **Component Library Tasks**: 13 (Phase 8)
- **Polish Tasks**: 19 (Phase 9)
- **E2E Testing Tasks**: 123 (Phase 10)

### Tasks by User Story
- **US1 (First-Time Setup)**: 22 tasks (Phase 3, 6)
- **US2 (Visual to Code Sync)**: 23 tasks (Phase 3, 4)
- **US3 (Code to Visual Sync)**: 13 tasks (Phase 4)
- **US4 (Multi-Page Editing)**: 9 tasks (Phase 6)
- **US5 (Component Import)**: 9 tasks (Phase 6)
- **US6 (Cursor IDE Integration)**: 10 tasks (Phase 7)
- **US7 (Code Preservation)**: 14 tasks (Phase 5)

### MVP Scope (Phases 1-4)
- **MVP Tasks**: ~80 tasks
- **MVP User Stories**: US1, US2, US3, US7 (core functionality)
- **Post-MVP**: US4, US5, US6, Component Library (enhancements)

## Next Steps

1. **Review tasks.md** for completeness and accuracy
2. **Start with Phase 1** (Setup) - all tasks are prerequisites
3. **Complete Phase 2** (Foundation) before proceeding to user stories
4. **Implement user stories in priority order** (US1, US2, US3, US7 first)
5. **Run tests after each phase** to ensure independent testability
6. **Use parallel execution** where possible to speed up development

