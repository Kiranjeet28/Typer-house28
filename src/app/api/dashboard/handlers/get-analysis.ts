import { prisma } from "@/lib/prisma"
import { getRoomSchema } from "../schema"

export async function getAnalysis(body: any) {
    try {
        const result = getRoomSchema.safeParse(body)
        if (!result.success) {
            throw new Error("Invalid data format")
        }

        const { email } = result.data

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
        })

        if (!user) {
            throw new Error("User not found")
        }

        // Process data for analysis
        const allTypingSpeeds = user.createdRooms.flatMap((room) =>
            room.typingSpeeds.map((ts) => ({
                ...ts,
                roomName: room.name,
                date: new Date(ts.createdAt).toLocaleDateString(),
                accuracy: ts.correctword > 0 ? (ts.correctword / (ts.correctword + ts.incorrectchar.length)) * 100 : 0,
            })),
        )

        return {
            user,
            typingSpeeds: allTypingSpeeds,
            totalSessions: allTypingSpeeds.length,
            averageWpm:
                allTypingSpeeds.length > 0
                    ? Math.round(allTypingSpeeds.reduce((sum, ts) => sum + ts.wpm, 0) / allTypingSpeeds.length)
                    : 0,
            bestWpm: allTypingSpeeds.length > 0 ? Math.max(...allTypingSpeeds.map((ts) => ts.wpm)) : 0,
            averageAccuracy:
                allTypingSpeeds.length > 0
                    ? Math.round(allTypingSpeeds.reduce((sum, ts) => sum + ts.accuracy, 0) / allTypingSpeeds.length)
                    : 0,
        }
    } catch (error) {
        console.error("getAnalysis error:", error)
        throw error
    }
}
