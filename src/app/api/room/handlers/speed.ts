import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TypingSpeed, User } from "@prisma/client";
import { z } from "zod";

// Schema for POST requests (update speed)
const speedRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  wpm: z.number().min(0).max(300),
  correctword: z.number().min(0),
  incorrectchar: z.array(z.string()),
  action: z.literal("speed")
});

// Schema for GET requests (fetch speeds)
const getRoomSpeedsSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  action: z.literal("getSpeed")
});

export async function SpeedRoomHandler(req: NextRequest, body: any) {
  console.log("SpeedRoomHandler called with body:", body);

  try {
    // Handle fetching speeds
    if (body.action === "getSpeed") {
      const parseResult = getRoomSpeedsSchema.safeParse(body);
      if (!parseResult.success) {
        console.error("GET Schema validation failed:", parseResult.error.errors);
        return NextResponse.json(
          {
            error: "Invalid request body for fetching speeds",
            details: parseResult.error.errors
          },
          { status: 400 }
        );
      }
      return await getSpeedsForRoom(parseResult.data.roomId);
    }

    // Handle updating speeds
    const parseResult = speedRoomSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("POST Schema validation failed:", parseResult.error.errors);
      return NextResponse.json(
        {
          error: "Invalid request body for speed update",
          details: parseResult.error.errors
        },
        { status: 400 }
      );
    }

    const { roomId, wpm, correctword, incorrectchar } = parseResult.data;

    const userId = req.headers.get("user-id");
    if (!userId) {
      console.error("No user ID in headers");
      return NextResponse.json({ error: "Unauthorized - missing user ID" }, { status: 401 });
    }

    if (wpm < 0 || wpm > 300) {
      console.error("Invalid WPM value:", wpm);
      return NextResponse.json({ error: "Invalid WPM value" }, { status: 400 });
    }

    await prisma.typingSpeed.upsert({
      where: { userId_roomId: { userId, roomId } }, // Uses @@unique([userId, roomId])
      update: { wpm, correctword, incorrectchar },
      create: { userId, roomId, wpm, correctword, incorrectchar }
    });

    console.log("Speed updated successfully");
    return NextResponse.json({ success: true, wpm, correctword });

  } catch (error) {
    console.error("SpeedRoomHandler error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function getSpeedsForRoom(roomId: string) {
  console.log("Fetching speeds for room:", roomId);

  try {
    const data: (TypingSpeed & { user: User })[] = await prisma.typingSpeed.findMany({
      where: { roomId },
      include: { user: true },
      orderBy: { wpm: "desc" }
    });

    const result = data.map((entry) => ({
      name: entry.user?.name || "Anonymous",
      wpm: entry.wpm,
      correctWords: entry.correctword,
      incorrectChars: entry.incorrectchar.length
    }));

    console.log(`Returning ${result.length} speed entries`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Database error in getSpeedsForRoom:", error);
    return NextResponse.json(
      {
        error: "Database error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
