import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import { characterPerformanceItemSchema, characterPerformanceSchema } from "../schema"
import { NextResponse } from "next/server";

export default async function characterPushHandler(
    body: object
) {
    const res = characterPerformanceItemSchema.parse(body);


    if (!res.typingSpeedId || !res.userId || !Array.isArray(res.characters)) {
         return NextResponse.json(
                        {
                            error: 'Authentication required',
                            code: 'UNAUTHORIZED',
                        },
                        { status: 401 }
                    );
    }

    try {
        await prisma.$transaction([
            // 🔥 REMOVE existing character rows for this session
            prisma.characterPerformance.deleteMany({
                where: { typingSpeedId: res.typingSpeedId }
            }),

            // 🔥 INSERT exactly ONE row per character
            prisma.characterPerformance.createMany({
                data: res.characters.map((c: any) => ({
                    char: c.char,
                    avgTimePerChar: c.avgTimePerChar,
                    maxTimePerChar: c.maxTimePerChar,
                    errorFrequency: c.errorFrequency,
                    typingSpeedId: res.typingSpeedId,
                    userId: res.userId
                }))
            })
        ])

        return  NextResponse.json(
                    {
                        success: true,
                        data: res,
                        message: 'Successfully updated character performance',
                    },
                    { status: 200 }
                );
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to save character performance" }, { status: 500 })
    }
}
