import { prisma } from "@/lib/prisma";
import { getRoomSchema } from "../schema";

export async function getRoom(body: unknown) {
    try {
        console.log("🔍 getRoom called with body:", JSON.stringify(body, null, 2));

        // Validate schema
        const result = getRoomSchema.safeParse(body);
        if (!result.success) {
            console.error("❌ Schema validation failed:", result.error.errors);
            throw new Error("Invalid data format");
        }

        const { email } = result.data;
        console.log("✅ Schema validated. Email:", email);

        // 1. Get user ID
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            console.error("❌ User not found for email:", email);
            throw new Error("User not found");
        }

        console.log("✅ User found:", { id: user.id, name: user.name, email: user.email });

        // 2. Get all rooms where user is EITHER creator OR member
        console.log("📡 Fetching rooms where user is creator OR member...");
        
        const rooms = await prisma.room.findMany({
            where: {
                OR: [
                    // User created the room
                    { creatorId: user.id },
                    // OR user is a member
                    {
                        members: {
                            some: {
                                userId: user.id,
                            },
                        },
                    },
                ],
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
                        id: true,
                        userId: true,
                        role: true,
                        status: true,
                        joinedAt: true,
                    },
                },
                typingSpeeds: {
                    where: {
                        userId: user.id, // Only get THIS user's typing speeds
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        id: true,
                        wpm: true,
                        correctword: true,
                        duration: true,
                        createdAt: true,
                        userStatus: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(`✅ Found ${rooms.length} rooms for user`);

        // Log details for debugging
        rooms.forEach((room, index) => {
            const isCreator = room.creatorId === user.id;
            const isMember = room.members.some(m => m.userId === user.id);
            console.log(`   Room ${index + 1}: ${room.name}`);
            console.log(`      - ID: ${room.id}`);
            console.log(`      - Creator: ${isCreator ? 'YES' : 'NO'}`);
            console.log(`      - Member: ${isMember ? 'YES' : 'NO'}`);
            console.log(`      - Status: ${room.status}`);
            console.log(`      - Typing Speeds: ${room.typingSpeeds.length}`);
        });

        // 3. Transform the data to match frontend expectations
        const transformedRooms = rooms.map(room => ({
            id: room.id,
            name: room.name,
            description: room.description || "",
            status: room.status,
            createdAt: room.createdAt.toISOString(),
            // Map typingSpeeds with all expected fields
            typingSpeeds: room.typingSpeeds.map(ts => ({
                id: ts.id,
                wpm: ts.wpm,
                correctword: ts.correctword,
                incorrectchar: [], // Not in schema - return empty array
                createdAt: ts.createdAt.toISOString(),
            })),
        }));

        console.log("✅ Transformed rooms data successfully");
        console.log("📊 Returning data:", JSON.stringify({
            totalRooms: transformedRooms.length,
            roomNames: transformedRooms.map(r => r.name),
            totalTypingSpeeds: transformedRooms.reduce((sum, r) => sum + r.typingSpeeds.length, 0),
        }, null, 2));

        return transformedRooms;

    } catch (error) {
        console.error("💥 getRoom error:", error);
        console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
        throw error;
    }
}