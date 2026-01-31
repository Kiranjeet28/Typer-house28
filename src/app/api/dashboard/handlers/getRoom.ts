import { prisma } from "@/lib/prisma";
import { getRoomSchema } from "../schema";

export async function getRoom(body: unknown) {
    try {
        console.log("getRoom called with body:", body);

        const result = getRoomSchema.safeParse(body);
        if (!result.success) {
            console.error("Schema validation failed:", result.error);
            throw new Error("Invalid data format");
        }

        const { email } = result.data;

        // 1. Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            console.warn("User not found for email:", email, "- returning empty array");
            return [];
        }

        // 2. Find rooms where user is creator OR member
        const rooms = await prisma.room.findMany({
            where: {
                OR: [
                    { creatorId: user.id },
                    {
                        members: {
                            some: { userId: user.id },
                        },
                    },
                ],
            },
            include: {
                creator: { select: { id: true, email: true, name: true } },
                members: { select: { userId: true, role: true } },
                typingSpeeds: {
                    orderBy: { createdAt: "desc" },
                    include: { charPerformance: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Transform to frontend-friendly shape
        const transformed = rooms.map((room) => ({
            id: room.id,
            name: room.name,
            description: room.description || "",
            status: room.status,
            createdAt: room.createdAt.toISOString(),
            typingSpeeds: (room.typingSpeeds || []).map((ts) => ({
                id: ts.id,
                wpm: ts.wpm,
                correctword: ts.correctword,
                incorrectchar: (ts.charPerformance || [])
                    .filter((cp) => cp.errorFrequency && cp.errorFrequency > 0)
                    .map((cp) => cp.char),
                createdAt: ts.createdAt.toISOString(),
            })),
        }));

        console.log(`Found ${transformed.length} rooms for user ${email}`);
        return transformed;
    } catch (error) {
        console.error("getRoom error:", error);
        throw error;
    }
}