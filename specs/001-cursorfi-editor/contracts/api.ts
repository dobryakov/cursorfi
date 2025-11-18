/**
 * CursorFi API Contracts
 * 
 * This file defines the tRPC router schema for the CursorFi Visual Site Editor backend API.
 * All procedures use Zod schemas for validation and TypeScript for type safety.
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

const UUID = z.string().uuid();
const FilePath = z.string().min(1); // Relative to project root
const Route = z.string().regex(/^\//); // Must start with /

// ============================================================================
// Project Procedures
// ============================================================================

export const projectRouter = {
  /**
   * Initialize a new project
   * POST /api/trpc/project.initialize
   */
  initialize: {
    input: z.object({
      path: z.string().min(1), // Absolute path to project directory
      framework: z.enum(['nextjs', 'vite', 'astro']).optional(), // Auto-detect if not provided
    }),
    output: z.object({
      id: UUID,
      path: z.string(),
      framework: z.enum(['nextjs', 'vite', 'astro']),
      frameworkVariant: z.string().nullable(),
      componentPaths: z.array(z.string()),
      createdAt: z.date(),
    }),
  },

  /**
   * Get project information
   * GET /api/trpc/project.get
   */
  get: {
    input: z.object({
      id: UUID.optional(), // If not provided, returns current project
    }),
    output: z.object({
      id: UUID,
      path: z.string(),
      framework: z.enum(['nextjs', 'vite', 'astro']),
      frameworkVariant: z.string().nullable(),
      componentPaths: z.array(z.string()),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  },
};

// ============================================================================
// Page Procedures
// ============================================================================

export const pageRouter = {
  /**
   * List all pages in the project
   * GET /api/trpc/page.list
   */
  list: {
    input: z.object({
      projectId: UUID.optional(),
    }),
    output: z.array(z.object({
      id: UUID,
      filePath: FilePath,
      route: Route,
      title: z.string().nullable(),
      lastModifiedAt: z.date(),
    })),
  },

  /**
   * Get a specific page with canvas state
   * GET /api/trpc/page.get
   */
  get: {
    input: z.object({
      id: UUID,
    }),
    output: z.object({
      id: UUID,
      filePath: FilePath,
      route: Route,
      title: z.string().nullable(),
      canvasState: z.any(), // CanvasState (complex nested object)
      lastSyncedAt: z.date(),
      lastModifiedAt: z.date(),
    }),
  },

  /**
   * Create a new page
   * POST /api/trpc/page.create
   */
  create: {
    input: z.object({
      filePath: FilePath,
      route: Route,
      title: z.string().nullable().optional(),
    }),
    output: z.object({
      id: UUID,
      filePath: FilePath,
      route: Route,
      title: z.string().nullable(),
      canvasState: z.any(),
      createdAt: z.date(),
    }),
  },

  /**
   * Update page canvas state (visual → code sync)
   * POST /api/trpc/page.updateCanvas
   */
  updateCanvas: {
    input: z.object({
      pageId: UUID,
      canvasState: z.any(), // CanvasState
    }),
    output: z.object({
      success: z.boolean(),
      syncOperationId: UUID,
      lastSyncedAt: z.date(),
    }),
  },

  /**
   * Switch to editing a different page
   * POST /api/trpc/page.switch
   */
  switch: {
    input: z.object({
      pageId: UUID,
    }),
    output: z.object({
      id: UUID,
      filePath: FilePath,
      canvasState: z.any(),
    }),
  },
};

// ============================================================================
// Component Procedures
// ============================================================================

export const componentRouter = {
  /**
   * List all available components (built-in + user-defined)
   * GET /api/trpc/component.list
   */
  list: {
    input: z.object({
      projectId: UUID.optional(),
      category: z.string().optional(),
      isBuiltIn: z.boolean().optional(),
    }),
    output: z.array(z.object({
      id: UUID,
      name: z.string(),
      filePath: FilePath.nullable(), // null for built-in components
      isBuiltIn: z.boolean(),
      category: z.string().nullable(),
      thumbnail: z.string().nullable(),
      description: z.string().nullable(),
    })),
  },

  /**
   * Scan project for new components
   * POST /api/trpc/component.scan
   */
  scan: {
    input: z.object({
      projectId: UUID.optional(),
      force: z.boolean().optional(), // Force re-scan even if recently scanned
    }),
    output: z.object({
      scanned: z.number(), // Number of components found
      components: z.array(z.object({
        id: UUID,
        name: z.string(),
        filePath: FilePath,
      })),
    }),
  },

  /**
   * Get component details including props
   * GET /api/trpc/component.get
   */
  get: {
    input: z.object({
      id: UUID,
    }),
    output: z.object({
      id: UUID,
      name: z.string(),
      filePath: FilePath.nullable(),
      props: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        defaultValue: z.any().nullable(),
        description: z.string().nullable(),
      })),
      isBuiltIn: z.boolean(),
      category: z.string().nullable(),
      metadata: z.object({
        description: z.string().nullable(),
        tags: z.array(z.string()),
        darkModeSupport: z.boolean(),
        responsive: z.boolean(),
      }),
    }),
  },
};

// ============================================================================
// File Operations
// ============================================================================

export const fileRouter = {
  /**
   * Read a file from the project
   * GET /api/trpc/file.read
   */
  read: {
    input: z.object({
      filePath: FilePath,
    }),
    output: z.object({
      content: z.string(),
      stat: z.object({
        size: z.number(),
        mtime: z.date(),
        isFile: z.boolean(),
      }),
    }),
  },

  /**
   * Write content to a file (with validation)
   * POST /api/trpc/file.write
   */
  write: {
    input: z.object({
      filePath: FilePath,
      content: z.string(),
      validate: z.boolean().optional(), // Validate syntax before writing
    }),
    output: z.object({
      success: z.boolean(),
      filePath: FilePath,
      stat: z.object({
        size: z.number(),
        mtime: z.date(),
      }),
    }),
  },
};

// ============================================================================
// Sync Operations
// ============================================================================

export const syncRouter = {
  /**
   * Trigger a manual sync operation
   * POST /api/trpc/sync.trigger
   */
  trigger: {
    input: z.object({
      pageId: UUID,
      direction: z.enum(['visual-to-code', 'code-to-visual']).optional(), // Auto-detect if not provided
    }),
    output: z.object({
      operationId: UUID,
      status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
      direction: z.enum(['visual-to-code', 'code-to-visual']),
    }),
  },

  /**
   * Get sync operation status
   * GET /api/trpc/sync.getStatus
   */
  getStatus: {
    input: z.object({
      operationId: UUID,
    }),
    output: z.object({
      id: UUID,
      status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
      direction: z.enum(['visual-to-code', 'code-to-visual']),
      startedAt: z.date(),
      completedAt: z.date().nullable(),
      error: z.string().nullable(),
      traceId: z.string(),
    }),
  },

  /**
   * Get recent sync operations for a page
   * GET /api/trpc/sync.list
   */
  list: {
    input: z.object({
      pageId: UUID,
      limit: z.number().min(1).max(100).optional(), // Default 10
    }),
    output: z.array(z.object({
      id: UUID,
      direction: z.enum(['visual-to-code', 'code-to-visual']),
      status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
      startedAt: z.date(),
      completedAt: z.date().nullable(),
      error: z.string().nullable(),
    })),
  },
};

// ============================================================================
// Canvas Operations
// ============================================================================

export const canvasRouter = {
  /**
   * Get current canvas state
   * GET /api/trpc/canvas.getState
   */
  getState: {
    input: z.object({
      pageId: UUID,
    }),
    output: z.object({
      canvasState: z.any(), // CanvasState
      selectedNodeId: z.string().nullable(),
      viewport: z.object({
        zoom: z.number(),
        panX: z.number(),
        panY: z.number(),
      }),
    }),
  },

  /**
   * Update canvas state (for undo/redo, selection changes)
   * POST /api/trpc/canvas.updateState
   */
  updateState: {
    input: z.object({
      pageId: UUID,
      canvasState: z.any(), // CanvasState
      selectedNodeId: z.string().nullable().optional(),
      viewport: z.object({
        zoom: z.number().optional(),
        panX: z.number().optional(),
        panY: z.number().optional(),
      }).optional(),
    }),
    output: z.object({
      success: z.boolean(),
    }),
  },
};

// ============================================================================
// Cursor IDE Integration
// ============================================================================

export const cursorRouter = {
  /**
   * Open a file in Cursor IDE
   * POST /api/trpc/cursor.open
   */
  open: {
    input: z.object({
      filePath: FilePath,
      line: z.number().min(1).optional(),
      column: z.number().min(1).optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }),
  },
};

// ============================================================================
// WebSocket Events
// ============================================================================

/**
 * WebSocket message types for real-time updates
 */
export const websocketEvents = {
  /**
   * File change detected
   * Sent from backend to frontend when file watcher detects change
   */
  fileChange: z.object({
    type: z.literal('fileChange'),
    filePath: FilePath,
    eventType: z.enum(['add', 'change', 'unlink', 'addDir', 'unlinkDir']),
    timestamp: z.date(),
    traceId: z.string(),
  }),

  /**
   * Sync operation status update
   * Sent from backend to frontend when sync operation status changes
   */
  syncStatus: z.object({
    type: z.literal('syncStatus'),
    operationId: UUID,
    status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
    pageId: UUID,
    traceId: z.string(),
  }),

  /**
   * Component scan complete
   * Sent from backend to frontend when component scan finishes
   */
  componentScanComplete: z.object({
    type: z.literal('componentScanComplete'),
    projectId: UUID,
    componentCount: z.number(),
    traceId: z.string(),
  }),

  /**
   * Conflict detected
   * Sent from backend to frontend when concurrent edit conflict detected
   */
  conflict: z.object({
    type: z.literal('conflict'),
    pageId: UUID,
    filePath: FilePath,
    externalTimestamp: z.date(),
    localTimestamp: z.date(),
    resolution: z.enum(['external-wins', 'local-wins']),
    traceId: z.string(),
  }),
};

// ============================================================================
// Main Router
// ============================================================================

/**
 * Complete tRPC router definition
 * 
 * Usage in Elysia:
 * ```typescript
 * import { Elysia } from 'elysia';
 * import { trpc } from '@elysiajs/trpc';
 * import { appRouter } from './router';
 * 
 * const app = new Elysia()
 *   .use(trpc(appRouter))
 *   .listen(3002);
 * ```
 */
export const appRouter = {
  project: projectRouter,
  page: pageRouter,
  component: componentRouter,
  file: fileRouter,
  sync: syncRouter,
  canvas: canvasRouter,
  cursor: cursorRouter,
};

export type AppRouter = typeof appRouter;

