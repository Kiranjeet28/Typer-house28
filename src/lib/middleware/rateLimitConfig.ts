/**
 * Enhanced Rate Limiting Configuration & Utilities
 */

interface RateLimitConfig {
    label: string;
    limit: number;
    windowMs: number;
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
    // Room operations
    room_create: {
        label: 'Create Room',
        limit: 10,
        windowMs: 60 * 60 * 1000, // 10 per hour
    },
    room_join: {
        label: 'Join Room',
        limit: 30,
        windowMs: 60 * 1000, // 30 per minute
    },
    room_delete: {
        label: 'Delete Room',
        limit: 10,
        windowMs: 60 * 60 * 1000, // 10 per hour
    },

    // Dashboard operations
    dashboard_get: {
        label: 'Dashboard Get',
        limit: 100,
        windowMs: 60 * 1000, // 100 per minute
    },

    // AI/Chat operations
    ai_tips: {
        label: 'AI Tips',
        limit: 20,
        windowMs: 60 * 60 * 1000, // 20 per hour
    },

    // General API
    general_api: {
        label: 'General API',
        limit: 500,
        windowMs: 60 * 1000, // 500 per minute
    },
};

/**
 * Get rate limit config by key
 */
export function getConfig(key: string): RateLimitConfig {
    return RATE_LIMIT_CONFIGS[key] || RATE_LIMIT_CONFIGS.general_api;
}

/**
 * Human-readable rate limit exceeded message
 */
export function getRateLimitMessage(config: RateLimitConfig, resetTime: number): string {
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);
    const minutes = Math.ceil(secondsUntilReset / 60);

    if (secondsUntilReset < 60) {
        return `Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`;
    }
    return `Rate limit exceeded. Try again in ${minutes} minutes.`;
}

/**
 * Rate limit configuration for different endpoints
 */
export const ENDPOINT_LIMITS = {
    // Aggressive limits for sensitive operations
    '/api/room/create': { limit: 10, windowMs: 3600000 }, // 10/hour
    '/api/room/delete': { limit: 10, windowMs: 3600000 }, // 10/hour
    '/api/auth/login': { limit: 5, windowMs: 900000 }, // 5/15min

    // Moderate limits for normal operations
    '/api/room': { limit: 50, windowMs: 60000 }, // 50/min
    '/api/dashboard': { limit: 100, windowMs: 60000 }, // 100/min
    '/api/chat': { limit: 20, windowMs: 3600000 }, // 20/hour

    // Generous limits for read-only operations
    '/api/realtime': { limit: 100, windowMs: 60000 }, // 100/min
};
