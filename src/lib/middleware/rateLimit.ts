/**
 * Rate limiting middleware for API routes
 * Prevents abuse by limiting requests per IP per time window
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

/**
 * Get client IP from request
 */
function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(request: Request, limit = MAX_REQUESTS, window = WINDOW_MS): boolean {
    const ip = getClientIp(request);
    const now = Date.now();

    if (!store[ip]) {
        store[ip] = { count: 1, resetTime: now + window };
        return false;
    }

    const entry = store[ip];

    // Reset counter if window expired
    if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + window;
        return false;
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
        return true;
    }

    entry.count++;
    return false;
}

/**
 * Get rate limit status for client
 */
export function getRateLimitStatus(request: Request): {
    remaining: number;
    resetTime: number;
} {
    const ip = getClientIp(request);
    const entry = store[ip];

    if (!entry) {
        return { remaining: MAX_REQUESTS - 1, resetTime: Date.now() + WINDOW_MS };
    }

    return {
        remaining: Math.max(0, MAX_REQUESTS - entry.count),
        resetTime: entry.resetTime,
    };
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimitStore() {
    const now = Date.now();
    for (const ip in store) {
        if (store[ip].resetTime < now) {
            delete store[ip];
        }
    }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
