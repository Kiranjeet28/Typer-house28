/**
 * Centralized logging utility
 * Use instead of console.log, console.error, etc.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    timestamp: string;
    message: string;
    data?: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Log an info message
 */
export function logInfo(message: string, data?: unknown) {
    const entry: LogEntry = {
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        data,
    };
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * Log a warning message
 */
export function logWarn(message: string, data?: unknown) {
    const entry: LogEntry = {
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        data,
    };
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * Log an error message
 */
export function logError(message: string, error?: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const entry: LogEntry = {
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        data: { error: errorMsg, stack },
    };
    console.error(`[ERROR] ${message}`, errorMsg, stack);
}

/**
 * Log a debug message (only in development)
 */
export function logDebug(message: string, data?: unknown) {
    if (!isDev) return;
    const entry: LogEntry = {
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        data,
    };
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * Log API request
 */
export function logApiRequest(method: string, path: string, body?: unknown) {
    logInfo(`API Request: ${method} ${path}`, body);
}

/**
 * Log API response
 */
export function logApiResponse(method: string, path: string, status: number, duration: number) {
    logInfo(`API Response: ${method} ${path} - ${status} (${duration}ms)`);
}

/**
 * Log database operation
 */
export function logDbOperation(operation: string, table: string, duration: number) {
    logDebug(`DB Operation: ${operation} on ${table} (${duration}ms)`);
}
