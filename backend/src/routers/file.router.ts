import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { fileService } from '../services/file.service';

const t = initTRPC.context().create();

export const fileRouter = t.router({
  read: t.procedure
    .input(z.object({
      path: z.string(),
    }))
    .query(async ({ input }) => {
      return await fileService.read(input.path);
    }),

  write: t.procedure
    .input(z.object({
      path: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await fileService.write(input.path, input.content);
    }),
});

