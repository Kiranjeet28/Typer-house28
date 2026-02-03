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

        // 2. Find rooms where user is a member (via RoomMember table)
        const memberRooms = await prisma.roomMember.findMany({
            where: { userId: user.id },
            select: { roomId: true },
        });

        const memberRoomIds = memberRooms.map(m => m.roomId);

        // Include rooms where the user is creator OR a member
        const rooms = await prisma.room.findMany({
            where: {
                OR: [
                    { creatorId: user.id },
                    { id: { in: memberRoomIds.length ? memberRoomIds : [] } },
                ],
            },
            include: {
                creator: { select: { id: true, email: true, name: true, username: true } },
                members: {
                    select: {
                        id: true,
                        role: true,
                        status: true,
                        joinedAt: true,
                        user: { select: { id: true, name: true, username: true, email: true } },
                    },
                },
                typingSpeeds: {
                    where: { userId: user.id }, // Only get current user's typing sessions
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
            creator: room.creator ? {
                id: room.creator.id,
                name: room.creator.name,
                username: room.creator.username,
                email: room.creator.email,
            } : null,
            members: (room.members || []).map(m => ({
                id: m.id,
                role: m.role,
                status: m.status,
                joinedAt: m.joinedAt.toISOString(),
                user: m.user ? {
                    id: m.user.id,
                    name: m.user.name,
                    username: m.user.username,
                    email: m.user.email,
                } : null,
            })),
            typingSpeeds: (room.typingSpeeds || []).map((ts) => ({
                id: ts.id,
                wpm: ts.wpm,
                correctword: ts.correctword,
                incorrectchar: (ts.charPerformance || [])
                    .filter((cp) => cp.errorFrequency && cp.errorFrequency > 0)
                    .map((cp) => cp.char),
                createdAt: ts.createdAt.toISOString(),
            })),
            _count: { members: room.members ? room.members.length : 0 },
        }));

        console.log(`Found ${transformed.length} rooms for user ${email}`);
        return transformed;
    } catch (error) {
        console.error("getRoom error:", error);
        throw error;
    }
}