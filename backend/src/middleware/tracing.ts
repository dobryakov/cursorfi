import { Elysia } from 'elysia';
import { getTraceId } from '../utils/tracing';
import { traceContext } from '../utils/tracing';

/**
 * T141: Request tracing middleware for Elysia
 * Adds trace IDs to all requests for observability
 */
export const tracingMiddleware = new Elysia()
  .onRequest(({ request, set }) => {
    // Extract or generate trace ID
    const traceId = getTraceId(request.headers as Record<string, string | string[] | undefined>);
    
    // Store in context
    traceContext.set(traceId);
    
    // Add trace ID to response headers
    set.headers['X-Trace-Id'] = traceId;
  })
  .onAfterHandle(({ set }) => {
    // Clear trace context after request
    traceContext.clear();
  });

