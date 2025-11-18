import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { syncService } from '../services/sync.service';

const t = initTRPC.context().create();

export const syncRouter = t.router({
  trigger: t.procedure
    .input(z.object({
      filePath: z.string(),
      direction: z.enum(['visual-to-code', 'code-to-visual']),
    }))
    .mutation(async ({ input }) => {
      return await syncService.trigger(input.filePath, input.direction);
    }),

  getStatus: t.procedure
    .input(z.object({
      filePath: z.string(),
    }))
    .query(async ({ input }) => {
      return await syncService.getStatus(input.filePath);
    }),

  list: t.procedure.query(async () => {
    return await syncService.list();
  }),
});

