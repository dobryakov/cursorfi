import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { trpc } from './routers/trpc';
import { healthRouter } from './routers/health.router';
import { websocketService } from './services/websocket.service';
import { fileWatcherService } from './services/file-watcher.service';
import { tracingMiddleware } from './middleware/tracing';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.CURSORFI_BACKEND_PORT || '4001', 10);

const app = new Elysia()
  .use(tracingMiddleware) // T141: Request tracing middleware
  .use(cors())
  .use(healthRouter)
  .use(trpc)
  .ws('/ws', {
    open(ws) {
      const id = crypto.randomUUID();
      (ws as any).id = id;
      websocketService.addClient(id, {
        id,
        send: (data: string) => ws.send(data),
        readyState: (ws as any).readyState || 1,
      });
    },
    close(ws) {
      const id = (ws as any).id;
      if (id) {
        websocketService.removeClient(id);
      }
    },
    message(ws, message) {
      // Echo back or handle incoming messages
      console.log('Received WebSocket message:', message);
    },
  })
  .listen(PORT, () => {
    logger.info('Backend server started', { port: PORT });
    
    // Start file watcher
    fileWatcherService.start();
  });

export default app;

