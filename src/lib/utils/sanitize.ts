/**
 * Input sanitization utilities
 */

/**
 * Sanitize room name - remove XSS attempts and trim whitespace
 */
export function sanitizeRoomName(name: string): string {
    return name
        .trim()
        .substring(0, 50) // Max 50 chars
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
}

/**
 * Sanitize room description
 */
export function sanitizeRoomDescription(desc: string): string {
    return desc
        .trim()
        .substring(0, 200) // Max 200 chars
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize custom text input
 */
export function sanitizeCustomText(text: string): string {
    return text
        .trim()
        .substring(0, 2000) // Max 2000 chars
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '');
}

/**
 * Validate room name
 */
export function validateRoomName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Room name is required' };
    }
    if (name.length > 50) {
        return { valid: false, error: 'Room name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        return { valid: false, error: 'Room name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    return { valid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email address' };
    }
    return { valid: true };
}

/**
 * Validate join code
 */
export function validateJoinCode(code: string): { valid: boolean; error?: string } {
    if (!code || code.length !== 6) {
        return { valid: false, error: 'Join code must be exactly 6 characters' };
    }
    if (!/^[A-Z0-9]{6}$/.test(code)) {
        return { valid: false, error: 'Join code must contain only uppercase letters and numbers' };
    }
    return { valid: true };
}
