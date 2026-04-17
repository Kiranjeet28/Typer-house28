import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { speedRoomSchema } from '../schema';

/* ----------------------------------
   Speed Update Handler
---------------------------------- */

export async function SpeedRoomHandler(body: unknown) {
  console.log("SpeedRoomHandler called:", body);

  try {
    const parsed = speedRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid speed payload",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      roomId,
      userId,
      wpm,
      correctword,
      userStatus,
      duration,
      charPerformance,
    } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const typingSpeed = await tx.typingSpeed.upsert({
        where: {
          userId_roomId: { userId, roomId },
        },
        update: {
          wpm,
          correctword,
          userStatus,
          duration,
        },
        create: {
          userId,
          roomId,
          wpm,
          correctword,
          duration,
        },
      });

      // Replace old character stats for this session
      await tx.characterPerformance.deleteMany({
        where: { typingSpeedId: typingSpeed.id },
      });

      if (charPerformance.length > 0) {
        await tx.characterPerformance.createMany({
          data: charPerformance.map((c) => ({
            char: c.char,
            avgTimePerChar: c.avgTimePerChar,
            maxTimePerChar: c.maxTimePerChar,
            errorFrequency: c.errorFrequency,
            typingSpeedId: typingSpeed.id,
            userId,
          })),
        });
      }

      return typingSpeed;
    });

    return NextResponse.json({
      success: true,
      typingSpeedId: result.id,
      wpm,
      correctword,
      duration,
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

/* ----------------------------------
   Leaderboard
---------------------------------- */

export async function getSpeedsForRoom(roomId: string) {
  try {
    const data = await prisma.typingSpeed.findMany({
      where: { roomId },
      include: { user: true, charPerformance: true },
      orderBy: { wpm: "desc" },
    });

    return NextResponse.json(
      data.map((entry) => {
        const errorByChar = new Map<string, number>();

        for (const perf of entry.charPerformance) {
          if (!perf.char) continue;
          const prev = errorByChar.get(perf.char) ?? 0;
          errorByChar.set(perf.char, prev + (perf.errorFrequency ?? 0));
        }

        const incorrectChars = Array.from(errorByChar.entries())
          .map(([char, count]) => ({ char, count }))
          .filter((item) => item.count > 0)
          .sort((a, b) => b.count - a.count);

        const incorrectchar = incorrectChars.reduce((sum, item) => sum + item.count, 0);

        return {
          name: entry.user?.name ?? "Anonymous",
          wpm: entry.wpm,
          status: entry.userStatus,
          correctword: entry.correctword,
          correctWords: entry.correctword,
          duration: entry.duration,
          incorrectchar,
          incorrectChars,
        };
      })
    );

  } catch (error) {
    console.error("Leaderboard error:", error);

    return NextResponse.json(
      {
        error: "Database error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
