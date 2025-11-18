import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { componentScannerService } from '../services/component-scanner.service';

const t = initTRPC.context().create();

export const componentRouter = t.router({
  list: t.procedure.query(async () => {
    return await componentScannerService.list();
  }),

  scan: t.procedure.mutation(async () => {
    return await componentScannerService.scan();
  }),

  get: t.procedure
    .input(z.object({
      filePath: z.string(),
    }))
    .query(async ({ input }) => {
      return await componentScannerService.get(input.filePath);
    }),
});

