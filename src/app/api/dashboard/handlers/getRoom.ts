import { prisma } from "@/lib/prisma";
import { getRoomSchema } from "../schema"; // Changed from "../schema" to "./schema" or "../index"

export async function getRoom(body: unknown) {
    try {
        // Add logging to debug
        console.log("getRoom called with body:", body);

        const result = getRoomSchema.safeParse(body);
        if (!result.success) {
            console.error("Schema validation failed:", result.error);
            throw new Error("Invalid data format");
        }

        const { email } = result.data;
        console.log("Fetching rooms for email:", email);

        // 1. Get user ID only (fast)
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            console.error("User not found for email:", email);
            throw new Error("User not found");
        }

        console.log("User found with ID:", user.id);

        // 2. Get all rooms user participated in (created OR joined)
        const rooms = await prisma.room.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                members: {
                    select: {
                        userId: true,
                        role: true,
                    },
                },
                typingSpeeds: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(`Found ${rooms.length} rooms for user`);

        // Transform the data to match frontend expectations
        const transformedRooms = rooms.map(room => ({
            id: room.id,
            name: room.name,
            description: room.description,
            status: room.status,
            createdAt: room.createdAt,
            typingSpeeds: room.typingSpeeds || [],
        }));

        return transformedRooms;
    } catch (error) {
        console.error("getRoom error:", error);
        throw error;
    }
}