import { z } from 'zod';

export const UserCreate = z.object({
    action: z.literal("create"),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    image: z.string().url('Invalid image URL').optional(),
});