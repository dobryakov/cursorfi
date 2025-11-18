import { Elysia } from 'elysia';
import { initTRPC } from '@trpc/server';
import { trpc as elysiaTrpc } from '@elysiajs/trpc';
import { fileRouter } from './file.router';
import { projectRouter } from './project.router';
import { pageRouter } from './page.router';
import { canvasRouter } from './canvas.router';
import { syncRouter } from './sync.router';
import { componentRouter } from './component.router';
import { cursorRouter } from './cursor.router';

const t = initTRPC.context().create();

export const appRouter = t.router({
  file: fileRouter,
  project: projectRouter,
  page: pageRouter,
  canvas: canvasRouter,
  sync: syncRouter,
  component: componentRouter,
  cursor: cursorRouter,
});

export type AppRouter = typeof appRouter;

export const trpc = new Elysia().use(
  elysiaTrpc(appRouter, {
    endpoint: '/api/trpc',
  })
);

