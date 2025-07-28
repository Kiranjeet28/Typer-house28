import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TypingSpeed, User } from "@prisma/client";
import { z } from "zod";

// Schema for speed requests - make wpm optional for GET requests
const speedRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  wpm: z.number().optional(),
  action: z.string()
});

export async function SpeedRoomHandler(req: NextRequest, body: any) {
    console.log("SpeedRoomHandler called with body:", body);
    
    try {
        const parseResult = speedRoomSchema.safeParse(body);

        if (!parseResult.success) {
            console.error("Schema validation failed:", parseResult.error.errors);
            return NextResponse.json({ 
                error: "Invalid request body", 
                details: parseResult.error.errors 
            }, { status: 400 });
        }

        const { roomId, wpm, action } = parseResult.data;
        console.log("Parsed data:", { roomId, wpm, action });

        // If this is a GET request (no wpm provided), return speeds for the room
        if (action === 'speed' && wpm === undefined) {
            console.log("Handling GET request for room speeds");
            return await getSpeedsForRoom(roomId);
        }

        // For POST requests (updating speeds), we need user ID and wpm
        console.log("Handling POST request for speed update");
        const userId = req.headers.get("user-id");
        console.log("User ID from headers:", userId);
        
        if (!userId) {
            console.error("No user ID in headers");
            return NextResponse.json({ error: "Unauthorized - missing user ID" }, { status: 401 });
        }

        if (wpm === undefined) {
            console.error("No WPM provided for POST request");
            return NextResponse.json({ error: "WPM is required for speed updates" }, { status: 400 });
        }

        console.log("Updating speed in database:", { userId, roomId, wpm });
        
        await prisma.typingSpeed.upsert({
            where: { userId_roomId: { userId, roomId } },
            update: { wpm },
            create: { userId, roomId, wpm },
        });

        console.log("Speed updated successfully");
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("SpeedRoomHandler error:", error);
        return NextResponse.json({ 
            error: "Internal server error", 
            message: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}

async function getSpeedsForRoom(roomId: string) {
    console.log("Fetching speeds for room:", roomId);
    
    try {
        const data: (TypingSpeed & { user: User })[] = await prisma.typingSpeed.findMany({
            where: { roomId },
            include: { user: true },
        });

        console.log("Found speed data:", data.length, "entries");

        const result = data.map((entry) => ({
            name: entry.user?.name || "Anon",
            wpm: entry.wpm,
        }));

        console.log("Returning speed data:", result);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Database error in getSpeedsForRoom:", error);
        return NextResponse.json({ 
            error: "Database error", 
            message: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}