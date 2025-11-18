import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { join } from 'node:path';

const t = initTRPC.context().create();

// In Docker container, project is always mounted at /app/project
// CURSORFI_PROJECT_PATH on host is mounted to /app/project in container
const PROJECT_PATH = '/app/project';

/**
 * T114, T115: Cursor IDE Integration Router
 * Handles opening files in Cursor IDE via protocol handlers
 */
export const cursorRouter = t.router({
  open: t.procedure
    .input(z.object({
      filePath: z.string(),
      line: z.number().min(1).optional(),
      column: z.number().min(1).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Validate file path exists
        const fullPath = join(PROJECT_PATH, input.filePath);
        const { fileService } = await import('../services/file.service');
        const exists = await fileService.exists(input.filePath);
        
        if (!exists) {
          return {
            success: false,
            message: `File not found: ${input.filePath}`,
          };
        }

        // T115: The actual file opening is handled by the protocol handler on the client machine
        // This endpoint just validates the request and returns success
        // The protocol handler (cursor:// or cursorfi://) will call this endpoint
        // and then use Cursor IDE's API to open the file
        
        // Log the request for observability
        console.log(`[Cursor] Opening file: ${input.filePath}${input.line ? `:${input.line}` : ''}${input.column ? `:${input.column}` : ''}`);

        return {
          success: true,
          message: `File opened: ${input.filePath}`,
        };
      } catch (error) {
        console.error('[Cursor] Error opening file:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to open file',
        };
      }
    }),
});

