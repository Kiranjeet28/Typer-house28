import { prisma } from "@/lib/prisma";

export async function getAllGames(body: unknown) {
    try {
        console.log("getAllGames called with body:", body);

        if (!body || typeof body !== "object" || typeof (body as any).email !== "string") {
            console.error("getAllGames: missing or invalid email in body", body);
            throw new Error("Missing or invalid email");
        }

        const email = (body as any).email as string;

        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (!user) {
            console.warn("getAllGames: user not found for email", email);
            return [];
        }

        // Find rooms where the user is creator or a member
        const rooms = await prisma.room.findMany({
            where: {
                OR: [
                    { creatorId: user.id },
                    { members: { some: { userId: user.id } } },
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
                    orderBy: { createdAt: "desc" },
                    include: { charPerformance: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const transformed = rooms.map((room) => ({
            id: room.id,
            name: room.name,
            description: room.description || "",
            status: room.status,
            createdAt: room.createdAt.toISOString(),
            creator: room.creator
                ? {
                    id: room.creator.id,
                    name: room.creator.name,
                    username: room.creator.username,
                    email: room.creator.email,
                }
                : null,
            members: (room.members || []).map((m) => ({
                id: m.id,
                role: m.role,
                status: m.status,
                joinedAt: m.joinedAt.toISOString(),
                user: m.user
                    ? {
                        id: m.user.id,
                        name: m.user.name,
                        username: m.user.username,
                        email: m.user.email,
                    }
                    : null,
            })) as any,
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
        console.error("getAllGames error:", error);
        throw error;
    }
}
