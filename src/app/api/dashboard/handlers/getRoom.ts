import { prisma } from "@/lib/prisma";
import { getRoomSchema } from "../schema";

export async function getRoom(body: unknown) {
    try {
        const result = getRoomSchema.safeParse(body);
        if (!result.success) {
            console.error("Schema validation failed:", result.error);
            throw new Error("Invalid data format");
        }

        const { email } = result.data;

        // 1. Get user ID only (fast)
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

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

        return rooms;
    } catch (error) {
        console.error("getRoom error:", error);
        throw error;
    }
}