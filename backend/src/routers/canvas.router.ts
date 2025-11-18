import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { pageService } from '../services/page.service';

const t = initTRPC.context().create();

export const canvasRouter = t.router({
  getState: t.procedure
    .input(z.object({
      filePath: z.string(),
    }))
    .query(async ({ input }) => {
      return await pageService.getCanvasState(input.filePath);
    }),

  updateState: t.procedure
    .input(z.object({
      filePath: z.string(),
      state: z.any(),
    }))
    .mutation(async ({ input }) => {
      return await pageService.updateCanvas(input.filePath, input.state);
    }),
});

