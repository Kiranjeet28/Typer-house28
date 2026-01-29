import { z } from "zod";

export const getRoomSchema = z.object({
    action: z.literal('get-room'),
    email: z.string().email(),
});

export const getAnalysisSchema = z.object({
    action: z.literal("get-analysis"),
    email: z.string().email(),
});

export type GetRoomInput = z.infer<typeof getRoomSchema>;
export type GetAnalysisInput = z.infer<typeof getAnalysisSchema>;