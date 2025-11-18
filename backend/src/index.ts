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
  .use(cors({
    origin: true, // Allow all origins
    credentials: true,
  }))
  .use(healthRouter)
  .use(trpc)
  .ws('/ws', {
    open(ws) {
      const id = crypto.randomUUID();
      (ws as any).id = id;
      logger.info('WebSocket client connected', { id, totalClients: websocketService.getClientCount() + 1 });
      websocketService.addClient(id, {
        id,
        send: (data: string) => ws.send(data),
        readyState: (ws as any).readyState || 1,
      });
    },
    close(ws) {
      const id = (ws as any).id;
      if (id) {
        logger.info('WebSocket client disconnected', { id });
        websocketService.removeClient(id);
      }
    },
    message(ws, message) {
      // Echo back or handle incoming messages
      logger.info('Received WebSocket message', { message });
    },
  })
  .listen({
    port: PORT,
    hostname: '0.0.0.0',
  }, (server) => {
    // Override default Elysia message with our own
    logger.info('Backend server started', { port: PORT, url: `http://localhost:${PORT}` });
    
    // Start file watcher
    fileWatcherService.start();
  });

export default app;

