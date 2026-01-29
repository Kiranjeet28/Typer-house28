import { prisma } from "@/lib/prisma";
import { getAnalysisSchema } from "../schema";

export async function getAnalysis(body: unknown) {
    try {
        const result = getAnalysisSchema.safeParse(body);
        if (!result.success) {
            console.error("Schema validation failed:", result.error);
            throw new Error("Invalid data format");
        }

        const { email } = result.data;

        const user = await prisma.user.findFirst({
            where: { email },
            include: {
                createdRooms: {
                    include: {
                        typingSpeeds: {
                            orderBy: {
                                createdAt: "asc",
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Process data for analysis
        const allTypingSpeeds = user.createdRooms.flatMap((room) =>
            room.typingSpeeds.map((ts) => ({
                ...ts,
                roomName: room.name,
                date: new Date(ts.createdAt).toLocaleDateString(),
            }))
        );

        const totalSessions = allTypingSpeeds.length;
        const averageWpm =
            totalSessions > 0
                ? Math.round(
                    allTypingSpeeds.reduce((sum, ts) => sum + ts.wpm, 0) / totalSessions
                )
                : 0;
        const bestWpm =
            totalSessions > 0 ? Math.max(...allTypingSpeeds.map((ts) => ts.wpm)) : 0;

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            typingSpeeds: allTypingSpeeds,
            totalSessions,
            averageWpm,
            bestWpm,
        };
    } catch (error) {
        console.error("getAnalysis error:", error);
        throw error;
    }
}