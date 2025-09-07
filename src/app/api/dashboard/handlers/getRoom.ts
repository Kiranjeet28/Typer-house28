import { prisma } from "@/lib/prisma"
import { getRoomSchema } from "../schema"

export async function getRoom(body: any) {
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
                        typingSpeeds: true,
                    },
                },
            },
        })

        if (!user) {
            throw new Error("User not found")
        }

        return user
    } catch (error) {
        console.error("getHandler error:", error)
        throw error
    }
}
