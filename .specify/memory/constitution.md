<!--
Sync Impact Report:
Version: 0.1.0 → 1.0.0 (Initial creation)
Modified principles: N/A (new document)
Added sections: All sections (new document)
Removed sections: N/A
Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ updated: .specify/templates/commands/constitution.md
Follow-up TODOs: None
-->

# CursorFi Project Constitution

**Version:** 1.0.0  
**Ratification Date:** 2025-01-27  
**Last Amended:** 2025-01-27

## Purpose

This constitution establishes the non-negotiable principles, architectural decisions, and governance rules for the CursorFi project. CursorFi is an open-source visual site editor in the browser (Figma + Webflow style) with instant two-way synchronization with local project files and deep integration with Cursor IDE. It enables developers to build pages visually while maintaining clean, editable code.

## Core Principles

### Principle 1: Container-First Architecture

**MUST:** All services, development tools, and runtime environments MUST run inside Docker containers. Direct installation of software on the host server is prohibited except for Docker, docker-compose, curl, and shell utilities.

**Rationale:** Ensures consistent environments across development, testing, and production. Enables easy deployment on remote servers and eliminates "works on my machine" issues. Supports the requirement that the project runs on a remote server while Cursor IDE operates on a local Windows machine.

**Enforcement:** All commands in documentation and scripts MUST target container execution. Docker Compose MUST be the primary orchestration mechanism.

### Principle 2: Modern Technology Stack Compliance

**MUST:** The project MUST use the specified modern 2025 technology stack:

- TypeScript 5.6+ for all code
- Bun as package manager and runtime (not Node.js)
- Vite 6 + React 19 + React Compiler for frontend
- Tailwind CSS v4 for styling
- shadcn/ui + Radix UI + Lucide icons for UI components
- craft.js (latest 2025 version) as canvas foundation
- @dnd-kit for complex drag-and-drop scenarios
- chokidar for file watching
- TypeScript Compiler API + babel-traverse for code parsing and generation
- Zustand for state management
- tRPC + Elysia on backend (Bun runtime)
- Zod for all schemas
- Vitest + Playwright for testing

**Rationale:** Ensures the project uses cutting-edge, performant technologies that align with 2025 best practices. Bun provides faster execution and better TypeScript support. The specified stack enables the two-way sync requirements and visual editing capabilities.

**Enforcement:** Package.json files MUST use Bun. All new dependencies MUST be evaluated against this stack before inclusion.

### Principle 3: Mandatory Testing at Every Phase

**MUST:** Every development phase MUST include automated tests. Tests MUST run inside Docker containers, never on the host. Unit tests run in service containers; API and e2e tests run in separate test containers connected to the main docker-compose.yml.

**Rationale:** Ensures reliability and prevents regressions. Containerized testing maintains consistency with production environments. The prompt explicitly states "Каждая фаза разработки должна проходить тесты" (Every development phase must pass tests).

**Enforcement:** No feature or phase is considered complete without passing tests. Test containers MUST be rebuilt when dependencies change. Playwright tests require browsers installed in test containers using proper base images (e.g., Debian-based Node.js images).

### Principle 4: Two-Way Synchronization Integrity

**MUST:** The system MUST maintain perfect bidirectional synchronization between the visual canvas (craft.js state) and local project files. Changes in the editor MUST be written to files (with 400ms debounce). File changes on disk MUST be detected (via chokidar) and reflected on the canvas. All elements MUST have data-cf-id attributes for tracking.

**Rationale:** This is the core value proposition of CursorFi. Developers must be able to edit visually and see code changes instantly, or edit code and see visual changes instantly. Without this, the tool fails its primary purpose.

**Enforcement:** All sync operations MUST be tested with Playwright scripts that verify both directions. Code generation MUST produce clean, formatted code. Parsing MUST handle TypeScript, JSX, and TSX files correctly.

### Principle 5: Code Preservation and Non-Destructive Editing

**MUST:** The system MUST NEVER break existing code. It MUST only add, modify, or remove Tailwind classes and props. User code inside components MUST always be preserved. When positioning is ambiguous, the system MUST use relative positioning with translate classes rather than arbitrary values.

**Rationale:** Developers must trust that CursorFi won't corrupt their codebase. The tool should enhance, not replace, their code. This principle ensures compatibility with existing projects and maintains developer confidence.

**Enforcement:** Code generation MUST use AST manipulation to preserve structure. Tests MUST verify that user code within components remains intact after sync operations.

### Principle 6: Configuration Externalization

**MUST:** All ports, paths, and environment-specific values MUST be externalized to configuration files (e.g., .env with env.example). Ports MUST NOT be hardcoded (avoid standard ports 80, 8080, 443). The project MUST use a single global cursorfi.json configuration file, never placing .cursorfi.json inside user projects.

**Rationale:** Supports deployment on remote servers with non-standard ports. Prevents configuration conflicts and allows easy customization. The global config approach avoids polluting user project directories.

**Enforcement:** All hardcoded values MUST be moved to configuration. Documentation MUST include examples using curl and shell scripts with configurable values.

### Principle 7: Semantic Tailwind Class Generation

**MUST:** The system MUST generate semantic Tailwind classes only. It MUST NEVER use inline styles (style={{}}) or arbitrary values (e.g., top-[123px]). Positioning MUST use proper Tailwind utilities (translate-x/y, grid col-start/span, flex order). The system MUST automatically choose between grid and flex layouts based on context.

**Rationale:** Maintains code quality and Tailwind best practices. Semantic classes are more maintainable and performant. Arbitrary values and inline styles defeat the purpose of using Tailwind CSS.

**Enforcement:** Code generation tests MUST verify that no inline styles or arbitrary values are produced. Positioning logic MUST be covered by 20+ test scenarios.

### Principle 8: Cursor IDE Integration

**MUST:** The system MUST provide deep integration with Cursor IDE. Right-click on elements MUST offer "Open in Cursor" functionality using cursor://file/ protocol. The system MUST support cursorfi:// protocol handler for opening pages from Cursor. Full compatibility with Cursor Composer (Cmd+K on selected elements) MUST be maintained.

**Rationale:** CursorFi's value proposition includes seamless integration with Cursor IDE. This integration enables the workflow where developers can jump between visual editing and code editing effortlessly.

**Enforcement:** Protocol handlers MUST be documented for macOS and Windows. Integration points MUST be tested to ensure Cursor IDE can communicate with CursorFi.

### Principle 9: Multi-Framework Support

**MUST:** The system MUST support Next.js (App Router and Pages Router), Vite, and Astro projects. It MUST automatically scan src/components and src/app directories to import user components as draggable blocks. Support for multiple pages (app/page.tsx, app/about/page.tsx, etc.) MUST be implemented.

**Rationale:** Developers use various frameworks. CursorFi must work with the most popular modern frameworks to maximize adoption. Auto-discovery of components reduces setup friction.

**Enforcement:** Tests MUST verify compatibility with each supported framework. Component scanning MUST be tested with projects containing 5+ custom components.

### Principle 10: Remote Development Support

**MUST:** The system MUST be designed for remote server deployment where CursorFi runs on a remote server and Cursor IDE runs on a local Windows machine. All network communication, file watching, and protocol handlers MUST account for this architecture.

**Rationale:** The prompt explicitly states this requirement. The system must function correctly in a distributed environment where the editor and IDE are on different machines.

**Enforcement:** Documentation MUST include remote deployment instructions. Network configuration MUST be tested in remote scenarios.

## Governance

### Amendment Procedure

1. Proposed amendments MUST be documented with rationale and impact analysis.
2. Amendments affecting core principles (Principles 1-10) require explicit approval.
3. Version MUST be incremented according to semantic versioning:
   - **MAJOR** (X.0.0): Backward incompatible changes, principle removals, or redefinitions
   - **MINOR** (0.X.0): New principles added or materially expanded guidance
   - **PATCH** (0.0.X): Clarifications, wording improvements, typo fixes, non-semantic refinements
4. After ratification, dependent templates and documentation MUST be updated to reflect changes.
5. A Sync Impact Report MUST be generated documenting all affected artifacts.

### Compliance Review

- All code changes MUST be evaluated against this constitution before merging.
- Automated tests MUST verify compliance with testable principles (e.g., container usage, code preservation).
- Documentation MUST reference relevant principles where applicable.
- Violations MUST be addressed before feature completion.

### Version History

- **1.0.0** (2025-01-27): Initial constitution based on project prompt requirements.
