import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/error';
import { deleteRoomSchema } from '../schema';

export async function deleteRoomHandler(body: unknown) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new AppError(401, 'Authentication required');
    }

    const parsed = deleteRoomSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, parsed.error.errors[0]?.message || 'Invalid room delete request');
    }

    const { roomId } = parsed.data;

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, creatorId: true, name: true },
    });

    if (!room) {
        throw new AppError(404, 'Room not found');
    }

    if (room.creatorId !== session.user.id) {
        throw new AppError(403, 'Only the room creator can delete this room');
    }

    // Step 1: Get all TypingSpeed IDs for this room (simpler query, avoids MongoDB transaction timeout)
    const typingSpeeds = await prisma.typingSpeed.findMany({
        where: { roomId },
        select: { id: true },
    });
    const typingSpeedIds = typingSpeeds.map((ts) => ts.id);

    // Step 2: Delete in transaction with simple direct queries
    await prisma.$transaction([
        prisma.characterPerformance.deleteMany({
            where: {
                typingSpeedId: { in: typingSpeedIds },
            },
        }),
        prisma.typingSpeed.deleteMany({
            where: { id: { in: typingSpeedIds } },
        }),
        prisma.roomMember.deleteMany({
            where: { roomId },
        }),
        prisma.room.delete({
            where: { id: roomId },
        }),
    ]);

    return NextResponse.json({
        success: true,
        message: 'Room deleted successfully',
        roomId,
    });
}
