import z from "zod";

export const getRoomSchema = z.object({
    action: z.literal('get-room'),
    email: z.string().email(),
});