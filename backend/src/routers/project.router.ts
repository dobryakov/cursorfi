import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { projectService } from '../services/project.service';

const t = initTRPC.context().create();

export const projectRouter = t.router({
  initialize: t.procedure
    .input(z.object({
      path: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await projectService.initialize(input.path);
    }),

  get: t.procedure.query(async () => {
    return await projectService.getMetadata();
  }),
});

