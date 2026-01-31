import { prisma } from "@/lib/prisma";
import { getAllSchema } from "../schema"; // Fix: Update path if needed (../index or ../schema)

const ML_URL = process.env.ML_SERVICE_URL;

// Validate ML_URL exists
if (!ML_URL) {
    throw new Error("ML_SERVICE_URL environment variable is not configured");
}

export async function getAll(body: unknown) {
    try {
        console.log("🔍 getAll called with body:", body);

        // Validate request body
        const data = getAllSchema.parse(body);
        console.log("✅ Schema validation passed for email:", data.email);

        // 1️⃣ Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            console.error("❌ User not found:", data.email);
            // Return error object, NOT NextResponse
            return {
                error: "User not found",
                status: 404
            };
        }

        console.log("✅ User found:", user.id);

        // 2️⃣ Fetch character performance
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
            take: 200,
        });

        console.log(`📊 Found ${characters.length} character performance records`);

        if (!characters.length) {
            console.log("⚠️ No character data found, returning empty riskyKeys");
            return {
                userId: user.id,
                riskyKeys: [],
            };
        }

        // 3️⃣ Feature mapping
        const lengthMap: Record<string, number> = {
            short: 1,
            medium: 2,
            long: 3,
            MARATHON: 4,
        };

        const rows = characters.map((cp) => ({
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

        console.log(`🤖 Calling ML service at ${ML_URL}/predict with ${rows.length} rows`);

        // 4️⃣ Call ML service
        const mlResponse = await fetch(`${ML_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows }),
        });

        if (!mlResponse.ok) {
            const errorText = await mlResponse.text();
            console.error("❌ ML service error:", mlResponse.status, errorText);
            throw new Error(`ML service error: ${mlResponse.status} - ${errorText}`);
        }

        const predictions = await mlResponse.json();
        console.log(`✅ ML predictions received:`, predictions.length, "predictions");

        // 5️⃣ Top risky keys
        const riskyKeys = predictions
            .sort((a: any, b: any) => b.risk_probability - a.risk_probability)
            .slice(0, 5)
            .map((p: any) => ({
                char: p.char,
                risk: Number(p.risk_probability.toFixed(2)),
            }));

        console.log("✅ Returning risky keys:", riskyKeys);

        // Return data object, NOT NextResponse
        return {
            userId: user.id,
            riskyKeys,
        };

    } catch (error: any) {
        console.error("💥 GET ALL + ML ERROR:", error);

        // Return error object, NOT NextResponse
        return {
            error: error.message || "Internal Server Error",
            status: 500
        };
    }
}