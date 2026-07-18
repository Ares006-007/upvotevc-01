/**
 * A lightweight structured logger to format logs cleanly.
 */
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'INFO', message, context, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'WARN', message, context, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString()
    }));
  }
};
