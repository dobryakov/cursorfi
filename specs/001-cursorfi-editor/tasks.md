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

- [ ] T058 [P] [US2] Create code parser service using TypeScript Compiler API in backend/src/services/code-parser.service.ts
- [ ] T059 [P] [US2] Implement AST parsing for TSX/JSX files in backend/src/services/code-parser.service.ts
- [ ] T060 [P] [US2] Create code generator service for AST to code conversion in backend/src/services/code-generator.service.ts
- [ ] T061 [P] [US2] Implement JSON DSL (craft.js state) to AST transformation in backend/src/services/sync.service.ts
- [ ] T062 [P] [US3] Implement AST to JSON DSL (craft.js state) transformation in backend/src/services/sync.service.ts
- [ ] T062a [P] [US3] Implement code file parsing to JSON DSL reconstruction in backend/src/services/code-parser.service.ts
- [ ] T063 [P] [US2] Create sync router with trigger, getStatus, list procedures in backend/src/routers/sync.router.ts
- [ ] T064 [P] [US2] Create sync service for visual-to-code synchronization in backend/src/services/sync.service.ts
- [ ] T065 [P] [US2] Implement debounced file write (400ms default) in backend/src/services/sync.service.ts
- [ ] T066 [P] [US2] Create page.updateCanvas procedure for visual-to-code sync in backend/src/routers/page.router.ts
- [ ] T067 [P] [US2] Implement frontend debounced sync trigger on canvas changes in frontend/src/hooks/useCanvasSync.ts
- [ ] T068 [P] [US3] Implement code-to-visual sync in sync service in backend/src/services/sync.service.ts
- [ ] T069 [P] [US3] Connect file watcher to sync service for code-to-visual sync in backend/src/services/file-watcher.service.ts
- [ ] T070 [P] [US3] Emit fileChange WebSocket events on file changes in backend/src/services/file-watcher.service.ts
- [ ] T071 [P] [US3] Implement frontend WebSocket listener for fileChange events in frontend/src/lib/websocket.ts
- [ ] T072 [P] [US3] Update canvas state when fileChange event received in frontend/src/hooks/useCanvasSync.ts
- [ ] T073 [P] [US2] [US3] Implement conflict detection using timestamp comparison in backend/src/services/sync.service.ts
- [ ] T074 [P] [US2] [US3] Implement last-write-wins conflict resolution in backend/src/services/sync.service.ts
- [ ] T075 [P] [US2] [US3] Emit conflict WebSocket events with resolution details in backend/src/services/sync.service.ts
- [ ] T076 [P] [US2] [US3] Create toast notification component for conflict alerts in frontend/src/components/Toast.tsx
- [ ] T077 [P] [US2] [US3] Implement conflict badge on affected canvas elements in frontend/src/components/Canvas.tsx
- [ ] T078 [P] [US2] [US3] Add sync status indicator to UI (pending, syncing, synced, error) in frontend/src/components/SyncStatus.tsx
- [ ] T079 [P] [US2] [US3] Implement sync operation tracking with trace IDs in backend/src/services/sync.service.ts
- [ ] T080 [P] [US2] [US3] Add structured logging for sync operations in backend/src/services/sync.service.ts

## Phase 5: Code Preservation & Generation (User Story 7)

**Goal**: Ensure user code is never modified, only Tailwind classes are updated. Generate semantic Tailwind classes.

**User Stories**: US7 (Code Preservation)

**Independent Test Criteria**: User code inside components remains intact after all operations, only className attributes are modified, semantic Tailwind classes are generated (no arbitrary values), 20+ positioning scenarios work correctly.

### Tasks

- [ ] T081 [P] [US7] Implement AST manipulation preserving all non-styling code in backend/src/services/code-preservation.service.ts
- [ ] T082 [P] [US7] Use babel-traverse for targeted className modifications in backend/src/services/code-preservation.service.ts
- [ ] T083 [P] [US7] Preserve comments, formatting, and component logic in backend/src/services/code-preservation.service.ts
- [ ] T084 [P] [US7] Create Tailwind class generator with semantic utilities in backend/src/services/tailwind-generator.service.ts
- [ ] T085 [P] [US7] Implement translate-x/y classes for positioning in backend/src/services/tailwind-generator.service.ts
- [ ] T086 [P] [US7] Implement grid-cols and grid positioning classes in backend/src/services/tailwind-generator.service.ts
- [ ] T087 [P] [US7] Implement flex utilities for flex layouts in backend/src/services/tailwind-generator.service.ts
- [ ] T088 [P] [US7] Implement absolute, relative, fixed, sticky positioning classes in backend/src/services/tailwind-generator.service.ts
- [ ] T089 [P] [US7] Implement automatic layout selection (grid vs flex) based on element relationships in backend/src/services/tailwind-generator.service.ts
- [ ] T090 [P] [US7] Ensure no arbitrary Tailwind values (e.g., top-[123px]) are generated in backend/src/services/tailwind-generator.service.ts
- [ ] T091 [P] [US7] Implement code validation before file write to prevent syntax errors in backend/src/services/code-generator.service.ts
- [ ] T092 [P] [US7] Use Prettier or TypeScript formatter for consistent code output in backend/src/services/code-generator.service.ts
- [ ] T093 [P] [US7] Create test cases for 20+ positioning scenarios in backend/src/services/__tests__/tailwind-generator.test.ts
- [ ] T094 [P] [US7] Create test cases for code preservation with various component structures in backend/src/services/__tests__/code-preservation.test.ts

## Phase 6: Framework Support & Component Scanning (User Story 1, 4, 5)

**Goal**: Support Next.js, Vite, and Astro projects. Auto-detect framework and scan for components.

**User Stories**: US1 (First-Time Setup - component scanning), US4 (Multi-Page Editing), US5 (Component Import)

**Independent Test Criteria**: Framework auto-detection works for all three frameworks, component scanning finds all components, new components appear in sidebar within 5 seconds, multi-page editing works, page switching loads correct state.

### Tasks

- [ ] T095 [P] [US1] [US4] Implement Next.js App Router page detection in backend/src/services/framework-detector.service.ts
- [ ] T096 [P] [US1] [US4] Implement Next.js Pages Router page detection in backend/src/services/framework-detector.service.ts
- [ ] T097 [P] [US1] [US4] Implement Vite page detection in backend/src/services/framework-detector.service.ts
- [ ] T098 [P] [US1] [US4] Implement Astro page detection in backend/src/services/framework-detector.service.ts
- [ ] T099 [P] [US1] [US5] Create component scanner service with parallel file processing in backend/src/services/component-scanner.service.ts
- [ ] T100 [P] [US1] [US5] Implement component metadata extraction (name, file path) in backend/src/services/component-scanner.service.ts
- [ ] T101 [P] [US1] [US5] Implement component prop extraction using TypeScript Compiler API in backend/src/services/component-scanner.service.ts
- [ ] T102 [P] [US1] [US5] Create component cache in memory (Map<filePath, ComponentMetadata>) in backend/src/services/component-scanner.service.ts
- [ ] T103 [P] [US1] [US5] Invalidate component cache on file add/remove events in backend/src/services/component-scanner.service.ts
- [ ] T104 [P] [US1] [US5] Create component router with list, scan, get procedures in backend/src/routers/component.router.ts
- [ ] T105 [P] [US1] [US5] Implement component.scan procedure with parallel processing in backend/src/routers/component.router.ts
- [ ] T106 [P] [US1] [US5] Emit componentScanComplete WebSocket event after scan in backend/src/services/component-scanner.service.ts
- [ ] T107 [P] [US1] [US5] Update ComponentLibrary to display user-defined components in frontend/src/components/ComponentLibrary.tsx
- [ ] T108 [P] [US1] [US5] Implement component import on file add (auto-scan) in backend/src/services/file-watcher.service.ts
- [ ] T109 [P] [US4] Implement page switching in frontend (load different page state) in frontend/src/hooks/usePageSwitch.ts
- [ ] T110 [P] [US4] Implement page.switch procedure to load page canvas state in backend/src/routers/page.router.ts
- [ ] T111 [P] [US4] Create page list UI component in frontend/src/components/PageList.tsx
- [ ] T112 [P] [US4] Implement multi-page state management in Zustand store in frontend/src/store/page.store.ts
- [ ] T113 [P] [US4] Ensure page state isolation (changes to one page don't affect others) in backend/src/services/page.service.ts

## Phase 7: Cursor IDE Integration (User Story 6)

**Goal**: Enable right-click "Open in Cursor" functionality and protocol handlers.

**User Stories**: US6 (Cursor IDE Integration)

**Independent Test Criteria**: Right-click menu appears on canvas elements, "Open in Cursor" opens correct file and line number in Cursor IDE, protocol handlers work via port forwarding.

### Tasks

- [ ] T114 [P] [US6] Create cursor router with open procedure in backend/src/routers/cursor.router.ts
- [ ] T115 [P] [US6] Implement cursor.open procedure (file path, line number) in backend/src/routers/cursor.router.ts
- [ ] T116 [P] [US6] Create right-click context menu component in frontend/src/components/ContextMenu.tsx
- [ ] T117 [P] [US6] Implement "Open in Cursor" menu item in frontend/src/components/ContextMenu.tsx
- [ ] T118 [P] [US6] Map canvas elements to file paths and line numbers in frontend/src/utils/element-tracking.ts
- [ ] T119 [P] [US6] Create protocol handler script for cursor:// protocol (Windows) in scripts/cursor-handler.js
- [ ] T120 [P] [US6] Create protocol handler script for cursorfi:// protocol (Windows) in scripts/cursorfi-handler.js
- [ ] T121 [P] [US6] Document protocol handler registration for Windows in README.md
- [ ] T122 [P] [US6] Implement protocol handler to call backend via localhost:3002 (forwarded port) in scripts/cursor-handler.js
- [ ] T123 [P] [US6] Test protocol handlers with Cursor IDE port forwarding in scripts/test-protocol-handlers.sh

## Phase 8: Pre-built Component Library (Enhancement)

**Goal**: Create 40+ pre-built page sections with dark mode and responsive design.

**User Stories**: Enhances US1, US2

**Independent Test Criteria**: 40+ components available in library, all support dark mode, all are responsive, components render correctly on canvas.

### Tasks

- [ ] T124 [P] Create Hero section component in frontend/src/components/library/Hero.tsx
- [ ] T125 [P] Create Navbar component in frontend/src/components/library/Navbar.tsx
- [ ] T126 [P] Create Pricing section component in frontend/src/components/library/Pricing.tsx
- [ ] T127 [P] Create Testimonials section component in frontend/src/components/library/Testimonials.tsx
- [ ] T128 [P] Create FAQ section component in frontend/src/components/library/FAQ.tsx
- [ ] T129 [P] Create CTA section component in frontend/src/components/library/CTA.tsx
- [ ] T130 [P] Create Footer component in frontend/src/components/library/Footer.tsx
- [ ] T131 [P] Create 33+ additional page section components in frontend/src/components/library/
- [ ] T132 [P] Ensure all components support dark mode (dark: classes) in frontend/src/components/library/
- [ ] T133 [P] Ensure all components are responsive (mobile, tablet, desktop) in frontend/src/components/library/
- [ ] T134 [P] Register all library components with craft.js in frontend/src/components/Editor.tsx
- [ ] T135 [P] Add component thumbnails and metadata to ComponentLibrary in frontend/src/components/ComponentLibrary.tsx
- [ ] T136 [P] Organize components by category (layout, content, form, etc.) in frontend/src/components/ComponentLibrary.tsx

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Add observability, error handling, performance optimization, and documentation.

**User Stories**: Cross-cutting for all user stories

**Independent Test Criteria**: Structured logs with trace IDs, metrics for sync operations, error recovery works, performance targets met (100ms visual response, 500ms sync), documentation complete.

### Tasks

- [ ] T137 [P] Implement structured logging with levels (info, warn, error) in backend/src/utils/logger.ts
- [ ] T138 [P] Add trace ID generation and propagation in backend/src/utils/tracing.ts
- [ ] T139 [P] Add trace IDs to all log statements in backend/src/
- [ ] T140 [P] Implement metrics collection (sync latency, throughput, errors) in backend/src/utils/metrics.ts
- [ ] T141 [P] Add request tracing middleware to Elysia in backend/src/middleware/tracing.ts
- [ ] T142 [P] Implement comprehensive error handling with recovery actions in frontend/src/utils/error-handler.ts
- [ ] T143 [P] Add error boundaries to React components in frontend/src/components/ErrorBoundary.tsx
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

## Task Summary

- **Total Tasks**: 155
- **Setup Tasks**: 13 (Phase 1)
- **Foundation Tasks**: 22 (Phase 2)
- **Visual Editor Tasks**: 22 (Phase 3)
- **Sync Tasks**: 23 (Phase 4)
- **Code Preservation Tasks**: 14 (Phase 5)
- **Framework Support Tasks**: 19 (Phase 6)
- **IDE Integration Tasks**: 10 (Phase 7)
- **Component Library Tasks**: 13 (Phase 8)
- **Polish Tasks**: 19 (Phase 9)

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

