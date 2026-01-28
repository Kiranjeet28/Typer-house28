import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export default async function characterPushHandler(
    body: any
) {
    console.log("=== CHARACTER PUSH HANDLER ===");
    console.log("Received body:", body);

    // Extract values (roomId is misleadingly named typingSpeedId)
    const roomId = body.typingSpeedId;  // This is actually roomId
    const userId = body.userId;
    const characters = body.characters;

    if (!roomId || !userId || !Array.isArray(characters)) {
        console.error("❌ Missing fields:", { roomId, userId, characters: !!characters });
        return NextResponse.json(
            {
                error: 'Missing required fields',
                code: 'BAD_REQUEST',
            },
            { status: 400 }
        );
    }

    try {
        // ✅ STEP 1: Find or create the actual TypingSpeed record
        let typingSpeed = await prisma.typingSpeed.findUnique({
            where: {
                userId_roomId: {
                    userId: userId,
                    roomId: roomId,
                },
            },
        });

        if (!typingSpeed) {
            console.log("📝 Creating TypingSpeed record for user:", userId);

            typingSpeed = await prisma.typingSpeed.create({
                data: {
                    userId: userId,
                    roomId: roomId,
                    wpm: 0,
                    correctword: 0,
                    duration: 0,
                    userStatus: "ACTIVE",
                },
            });

            console.log("✅ Created TypingSpeed:", typingSpeed.id);
        } else {
            console.log("✅ Found existing TypingSpeed:", typingSpeed.id);
        }

        // ✅ STEP 2: Save character performance using the actual typingSpeedId
        await prisma.$transaction([
            // 🔥 REMOVE existing character rows for this session
            prisma.characterPerformance.deleteMany({
                where: { typingSpeedId: typingSpeed.id }  // ✅ Use actual DB record ID
            }),

            // 🔥 INSERT exactly ONE row per character
            prisma.characterPerformance.createMany({
                data: characters.map((c: any) => ({
                    char: c.char,
                    avgTimePerChar: c.avgTimePerChar,
                    maxTimePerChar: c.maxTimePerChar,
                    errorFrequency: c.errorFrequency,
                    typingSpeedId: typingSpeed.id,  // ✅ Use actual DB record ID
                    userId: userId
                }))
            })
        ]);

        console.log("✅ Saved", characters.length, "character records");

        return NextResponse.json(
            {
                success: true,
                typingSpeedId: typingSpeed.id,
                characterCount: characters.length,
                message: 'Successfully updated character performance',
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("❌ Database error:", err);
        console.error("Error details:", {
            message: err.message,
            code: err.code,
            meta: err.meta
        });

        return NextResponse.json({
            error: "Failed to save character performance",
            details: err.message
        }, { status: 500 });
    }
}