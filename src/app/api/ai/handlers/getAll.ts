import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllSchema } from "../schema";

const ML_URL = process.env.ML_SERVICE_URL as string;
export async function getAllUserData(body: Object) {
    try {
        const data = getAllSchema.parse(body);

        // 1️⃣ Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // 2️⃣ Fetch character performance (latest data)
        const characters = await prisma.characterPerformance.findMany({
            where: {
                typingSpeed: {
                    userId: user.id,
                },
            },
            select: {
                char: true,
                avgTimePerChar: true,
                maxTimePerChar: true,
                errorFrequency: true,
                typingSpeed: {
                    select: {
                        room: {
                            select: {
                                textLength: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                typingSpeed: {
                    createdAt: "desc",
                },
            },
            take: 200, // real-time safe
        });

        if (characters.length === 0) {
            return NextResponse.json({
                userId: user.id,
                riskyKeys: [],
            });
        }

        // 3️⃣ Map DB data → ML features
        const lengthMap: Record<string, number> = {
            short: 1,
            medium: 2,
            long: 3,
            MARATHON: 4,
        };

        const rows = characters.map((cp: any) => ({
            userId: user.id,
            char: cp.char,
            accuracy: cp.errorFrequency === 0 ? 1 : 0.8,
            char_time_variance: cp.maxTimePerChar - cp.avgTimePerChar,
            recent_error_flag: cp.errorFrequency > 0 ? 1 : 0,
            avg_error_freq_last_N: cp.errorFrequency,
            avg_char_time_last_N: cp.avgTimePerChar,
            text_length_level:
                lengthMap[cp.typingSpeed.room.textLength] ?? 1,
        }));

        // 4️⃣ Call ML service
        const mlResponse = await fetch(`${ML_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows }),
        });

        if (!mlResponse.ok) {
            throw new Error("ML service error");
        }

        const predictions = await mlResponse.json();

        // 5️⃣ Post-process (top risky keys)
        const riskyKeys = predictions
            .sort((a: any, b: any) => b.risk_probability - a.risk_probability)
            .slice(0, 5)
            .map((p: any) => ({
                char: p.char,
                risk: Number(p.risk_probability.toFixed(2)),
            }));

        return NextResponse.json({
            userId: user.id,
            riskyKeys,
        });

    } catch (error: any) {
        console.error("GET ALL + ML ERROR:", error);

        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
