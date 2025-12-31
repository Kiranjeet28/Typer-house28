import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TypingSpeed, User } from "@prisma/client";
import { z } from "zod";

/**
 * Schema for speed updates
 */
const speedRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  userId: z.string().min(1, "User ID is required"),
  wpm: z.number().int().min(0).max(300),
  correctword: z.number().int().min(0),
  incorrectchar: z.array(z.string()),
  action: z.literal("speed"),
  status: z.enum(["ACTIVE", "LEFT"]).optional(),
});

export async function SpeedRoomHandler(body: unknown) {
  console.log("SpeedRoomHandler called with body:", body);

  try {
    const parseResult = speedRoomSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body for speed update",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { roomId, userId, wpm, correctword, incorrectchar } = parseResult.data;

    await prisma.typingSpeed.upsert({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
      update: {
        wpm,
        correctword,
        incorrectchar,
        status : parseResult.data.status || "ACTIVE",
      },
      create: {
        userId,
        roomId,
        wpm,
        correctword,
        incorrectchar,
        status : parseResult.data.status || "ACTIVE"
      },
    });

    return NextResponse.json({
      success: true,
      wpm,
      correctword,
      status: parseResult.data.status || "ACTIVE",
    });

  } catch (error) {
    console.error("SpeedRoomHandler error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get leaderboard for a room
 */
export async function getSpeedsForRoom(roomId: string) {
  console.log("Fetching speeds for room:", roomId);

  try {
    const data: (TypingSpeed & { user: User })[] =
      await prisma.typingSpeed.findMany({
        where: { roomId },
        include: { user: true },
        orderBy: { wpm: "desc" },
      });

    const result = data.map((entry) => ({
      name: entry.user?.name ?? "Anonymous",
      wpm: entry.wpm,
      correctWords: entry.correctword,
      incorrectChars: entry.incorrectchar.length,
      status: entry.status, // now matches schema
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("Database error in getSpeedsForRoom:", error);

    return NextResponse.json(
      {
        error: "Database error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
