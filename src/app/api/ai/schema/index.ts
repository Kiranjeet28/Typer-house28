import { z } from 'zod';

export const getAllSchema = z.object({
    action: z.literal("getAll"),
    email: z.string().email('Invalid email address'),
});

export type GetAllInput = z.infer<typeof getAllSchema>;