/**
 * T138: Trace ID generation and propagation
 * Provides request tracing for observability
 */

/**
 * Generate a unique trace ID
 */
export function generateTraceId(): string {
  return `trace-${crypto.randomUUID()}`;
}

/**
 * Extract trace ID from headers or generate a new one
 */
export function getTraceId(headers?: Record<string, string | string[] | undefined>): string {
  if (headers) {
    const traceId = headers['x-trace-id'] || headers['X-Trace-Id'];
    if (traceId) {
      return Array.isArray(traceId) ? traceId[0] : traceId;
    }
  }
  return generateTraceId();
}

/**
 * Context for storing trace ID during request processing
 */
class TraceContext {
  private context = new Map<string, string>();

  set(traceId: string): void {
    this.context.set('traceId', traceId);
  }

  get(): string | undefined {
    return this.context.get('traceId');
  }

  clear(): void {
    this.context.clear();
  }
}

export const traceContext = new TraceContext();

