import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { pageService } from '../services/page.service';

const t = initTRPC.context().create();

export const pageRouter = t.router({
  list: t.procedure.query(async () => {
    return await pageService.list();
  }),

  get: t.procedure
    .input(z.object({
      filePath: z.string(),
    }))
    .query(async ({ input }) => {
      return await pageService.get(input.filePath);
    }),

  create: t.procedure
    .input(z.object({
      filePath: z.string(),
      route: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await pageService.create(input.filePath, input.route);
    }),

  switch: t.procedure
    .input(z.object({
      filePath: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await pageService.switch(input.filePath);
    }),

  updateCanvas: t.procedure
    .input(z.object({
      filePath: z.string(),
      canvasState: z.any(),
    }))
    .mutation(async ({ input }) => {
      return await pageService.updateCanvas(input.filePath, input.canvasState);
    }),
});

