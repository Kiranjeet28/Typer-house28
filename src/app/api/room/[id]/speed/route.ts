import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TypingSpeed, User } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("id");
  const { wpm } = await req.json();
  const user = req.headers.get("user-id");

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!roomId) return NextResponse.json({ error: "Missing room id" }, { status: 400 });

  await prisma.typingSpeed.upsert({
    where: { userId_roomId: { userId: user, roomId } },
    update: { wpm },
    create: { userId: user, roomId, wpm },
  });

  return NextResponse.json({ success: true });
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("id");
  if (!roomId) return NextResponse.json({ error: "Missing room id" }, { status: 400 });

  const data: (TypingSpeed & { user: User })[] = await prisma.typingSpeed.findMany({
    where: { roomId },
    include: { user: true },
  });

  return NextResponse.json(
    data.map((entry) => ({
      name: entry.user?.name || "Anon",
      wpm: entry.wpm,
    }))
  );
}
    
