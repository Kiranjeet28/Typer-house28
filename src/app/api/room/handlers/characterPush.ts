import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export default async function characterPushHandler(body: any) {
    console.log("=== CHARACTER PUSH HANDLER ===");
    console.log("Received body:", body);

    // Extract values - the parameter is named typingSpeedId but it's actually roomId
    const roomId = body.typingSpeedId;  // ✅ This is actually the roomId being sent
    const userId = body.userId;
    const characters = body.characters;

    // Validate inputs
    if (!roomId || !userId || !Array.isArray(characters)) {
        console.error("❌ Missing required fields:", { roomId, userId, hasCharacters: !!characters });
        return NextResponse.json(
            {
                error: 'Missing required fields: roomId, userId, or characters',
                code: 'BAD_REQUEST',
            },
            { status: 400 }
        );
    }

    if (characters.length === 0) {
        console.warn("⚠️ Characters array is empty");
        return NextResponse.json(
            { error: 'Characters array is empty' },
            { status: 400 }
        );
    }

    try {
        // ✅ STEP 1: Find the TypingSpeed record using roomId and userId
        let typingSpeed = await prisma.typingSpeed.findUnique({
            where: {
                userId_roomId: {
                    userId: userId,
                    roomId: roomId,
                },
            },
        });

        // ✅ STEP 2: If not found, create a new TypingSpeed record
        if (!typingSpeed) {
            console.log("📝 TypingSpeed record not found. Creating new one for user:", userId);

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

            console.log("✅ Created new TypingSpeed record with ID:", typingSpeed.id);
        } else {
            console.log("✅ Found existing TypingSpeed record with ID:", typingSpeed.id);
        }

        // ✅ STEP 3: Save character performance data using the actual TypingSpeed record ID
        await prisma.$transaction([
            // Delete existing character performance for this typing session
            prisma.characterPerformance.deleteMany({
                where: { typingSpeedId: typingSpeed.id }  // ✅ Using the actual DB record ID
            }),

            // Insert new character performance records
            prisma.characterPerformance.createMany({
                data: characters.map((c: any) => ({
                    char: c.char,
                    avgTimePerChar: c.avgTimePerChar,
                    maxTimePerChar: c.maxTimePerChar,
                    errorFrequency: c.errorFrequency,
                    typingSpeedId: typingSpeed.id,  // ✅ Using the actual DB record ID
                    userId: userId
                }))
            })
        ]);

        console.log("✅ Successfully saved", characters.length, "character performance records");

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
        console.error("❌ Database error in characterPushHandler:", err);
        console.error("Error details:", {
            message: err.message,
            code: err.code,
            meta: err.meta,
            stack: err.stack
        });

        return NextResponse.json({
            error: "Failed to save character performance",
            details: err.message,
            code: err.code
        }, { status: 500 });
    }
}