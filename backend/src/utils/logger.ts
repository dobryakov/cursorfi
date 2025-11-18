/**
 * T137: Structured logging with levels (info, warn, error)
 * Provides consistent logging format with trace IDs
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  traceId?: string;
  timestamp: string;
  [key: string]: any;
}

const LOG_LEVEL: LogLevel = (process.env.CURSORFI_LOG_LEVEL as LogLevel) || 'info';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, meta?: Record<string, any>): void {
    if (!shouldLog('info')) return;
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.log(formatLog(entry));
  },

  warn(message: string, meta?: Record<string, any>): void {
    if (!shouldLog('warn')) return;
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error | unknown, meta?: Record<string, any>): void {
    if (!shouldLog('error')) return;
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      entry.error = error;
    }

    console.error(formatLog(entry));
  },

  debug(message: string, meta?: Record<string, any>): void {
    if (!shouldLog('debug')) return;
    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.debug(formatLog(entry));
  },
};

