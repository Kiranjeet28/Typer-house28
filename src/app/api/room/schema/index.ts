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
    textLength: z.enum(['SHORT', 'MEDIUM', 'LONG', 'MARATHON']).default('MEDIUM'),
    timeLimit: z.number()
        .int()
        .min(30, 'Time limit must be at least 30 seconds')
        .max(600, 'Time limit cannot exceed 10 minutes')
        .optional(),
    customText: z.string()
        .max(2000, 'Custom text must be less than 2000 characters')
        .optional(),
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
    id: z.string(),
    status: z.enum(['WAITING', 'IN_GAME', 'FINISHED', 'EXPIRED']),
});
export const endrollRoomSchema = z.object({
    action: z.literal("endroll").refine(val => val === "endroll", {
        message: "Action must be 'endroll'"
    }),
    id: z.string(),
});

export const get = z.object({
    action: z.literal('get'),
    roomId: z.string(),
});
export const characterPerformanceSchema = z.object({
  char: z.string().min(1).max(2),
  avgTimePerChar: z.number().positive(),
  maxTimePerChar: z.number().positive(),
  errorFrequency: z.number().int().min(0),
});

export const speedRoomSchema = z.object({
  action: z.literal("speed"),
  roomId: z.string().min(1),
  userId: z.string().min(1),
  wpm: z.number().int().min(0).max(300),
  correctword: z.number().int().min(0),
  duration: z.number().int().min(0),
  userStatus: z.enum(["ACTIVE", "LEFT"]).optional(),
  charPerformance: z.array(characterPerformanceSchema),
});

export const characterPerformanceItemSchema = z.object({
    action: z.literal("charPerformance"),
       typingSpeedId: z.string().min(1, "Typing Speed ID is required"),
       userId: z.string().min(1, "User ID is required"),
       characters: z.array(characterPerformanceSchema).min(1, "At least one character performance is required"),
});

export const characterPerformanceEntrySchema = z.object({
        char: z
            .string()
            .min(1, "Character is required")
            .max(1, "Only single character allowed"),

        avgTimePerChar: z
            .number()
            .positive("Average time must be positive"),

        maxTimePerChar: z
            .number()
            .positive("Max time must be positive"),

        errorFrequency: z
            .number()
            .int()
            .min(0, "Error frequency cannot be negative"),
    })