import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.context().create();

export const cursorRouter = t.router({
  open: t.procedure
    .input(z.object({
      filePath: z.string(),
      lineNumber: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement cursor:// protocol handler
      // For now, just return success
      return {
        success: true,
        filePath: input.filePath,
        lineNumber: input.lineNumber,
      };
    }),
});

