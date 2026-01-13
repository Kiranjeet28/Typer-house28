import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { speedWpmSchema } from '../schema';

/* ----------------------------------
   Speed Update Handler
---------------------------------- */

export async function SpeedWpmHandler(body: unknown) {
  console.log("SpeedWpmHandler called:", body);

  try {
      const parsed = speedWpmSchema.safeParse(body);

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
    console.error("SpeedWpmHandler error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}