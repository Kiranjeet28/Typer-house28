import { z } from 'zod';

export const createRoomSchema = z.object({
    action: z.literal('create'),
    name: z.string()
        .min(1, 'Room name is required')
        .max(50, 'Room name must be less than 50 characters')
        .trim(),
    description: z.string()
        .max(200, 'Description must be less than 200 characters')
        .optional(),
    maxPlayers: z.number()
        .int()
        .min(2, 'Room must allow at least 2 players')
        .max(10, 'Room cannot have more than 10 players')
        .default(4),
    isPrivate: z.boolean().default(false),
    gameMode: z.enum(['SPEED_TEST', 'ACCURACY_TEST', 'SURVIVAL', 'CUSTOM_TEXT']).default('SPEED_TEST'),
    textLength: z.enum(['SHORT', 'MEDIUM', 'LONG', 'MARATHON']).default('MEDIUM'),
    timeLimit: z.number()
        .int()
        .min(30, 'Time limit must be at least 30 seconds')
        .max(600, 'Time limit cannot exceed 10 minutes')
        .optional(),
    customText: z.string()
        .max(2000, 'Custom text must be less than 2000 characters')
        .optional(),
}).refine((data) => {
    // If game mode is CUSTOM_TEXT, customText is required
    if (data.gameMode === 'CUSTOM_TEXT' && !data.customText) {
        return false;
    }
    return true;
}, {
    message: 'Custom text is required when game mode is CUSTOM_TEXT',
    path: ['customText']
});

// Response schemas
export const roomResponseSchema = z.object({
    action: z.literal('res'),
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    joinCode: z.string(),
    maxPlayers: z.number(),
    isPrivate: z.boolean(),
    status: z.enum(['WAITING', 'IN_GAME', 'FINISHED', 'EXPIRED']),
    gameMode: z.enum(['SPEED_TEST', 'ACCURACY_TEST', 'SURVIVAL', 'CUSTOM_TEXT']),
    textLength: z.enum(['SHORT', 'MEDIUM', 'LONG', 'MARATHON']),
    timeLimit: z.number().nullable(),
    customText: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    expiresAt: z.date(),
    creator: z.object({
        id: z.string(),
        name: z.string().nullable(),
        username: z.string().nullable(),
    }),
    members: z.array(z.object({
        id: z.string(),
        role: z.enum(['CREATOR', 'PLAYER', 'SPECTATOR']),
        status: z.enum(['JOINED', 'READY', 'PLAYING', 'FINISHED', 'LEFT']),
        joinedAt: z.date(),
        user: z.object({
            id: z.string(),
            name: z.string().nullable(),
            username: z.string().nullable(),
        }),
    })),
    _count: z.object({
        members: z.number(),
    }),
});

// Error types
export class RoomError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'RoomError';
    }
}
export const joinRoomSchema = z.object({
    action: z.literal('join'),
    joinCode: z.string()
        .length(6, 'Join code must be exactly 6 characters')
        .regex(/^[A-Z0-9]{6}$/, 'Join code must contain only uppercase letters and numbers'),
});
export const startRoomSchema = z.object({
    action: z.literal('start'),
    id : z.string().uuid('Invalid room ID format'),
});
export const endrollRoomSchema = z.object({
    action: z.literal('endroll'),
    id : z.string().uuid('Invalid room ID format'),
});

export const speedRoomSchema = z.object({
    action: z.literal('speed'),
    roomId: z.string().uuid('Invalid room ID format'),
    wpm: z.number(),
});
