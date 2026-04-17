/**
 * Expired Room Cleanup Service
 * Runs periodically to delete expired rooms from the database
 */

import { prisma } from '@/lib/prisma';
import { logInfo, logError } from '@/lib/utils/logging';

interface CleanupResult {
    success: boolean;
    deletedRooms: number;
    deletedMembers: number;
    deletedSpeeds: number;
    deletedCharPerf: number;
    error?: string;
    duration: number;
}

/**
 * Delete expired rooms and their associated data
 */
export async function cleanupExpiredRooms(): Promise<CleanupResult> {
    const startTime = Date.now();
    let result: CleanupResult = {
        success: false,
        deletedRooms: 0,
        deletedMembers: 0,
        deletedSpeeds: 0,
        deletedCharPerf: 0,
        duration: 0,
    };

    try {
        logInfo('Starting expired room cleanup...');

        // Find expired rooms
        const expiredRooms = await prisma.room.findMany({
            where: {
                expiresAt: {
                    lt: new Date(), // Less than current time
                },
            },
            select: { id: true },
        });

        if (expiredRooms.length === 0) {
            logInfo('No expired rooms to cleanup');
            result.success = true;
            result.duration = Date.now() - startTime;
            return result;
        }

        const expiredRoomIds = expiredRooms.map((r: { id: string }) => r.id);

        logInfo(`Found ${expiredRoomIds.length} expired rooms to delete`);

        // Step 1: Get all TypingSpeed IDs first (simpler query, avoids MongoDB transaction timeout)
        const typingSpeeds = await prisma.typingSpeed.findMany({
            where: { roomId: { in: expiredRoomIds } },
            select: { id: true },
        });
        const typingSpeedIds = typingSpeeds.map((ts) => ts.id);

        // Step 2: Delete in transaction with simple direct queries
        const deleteResults = await prisma.$transaction([
            // Delete character performance (using direct IDs)
            prisma.characterPerformance.deleteMany({
                where: {
                    typingSpeedId: { in: typingSpeedIds },
                },
            }),

            // Delete typing speeds
            prisma.typingSpeed.deleteMany({
                where: {
                    id: { in: typingSpeedIds },
                },
            }),

            // Delete room members
            prisma.roomMember.deleteMany({
                where: {
                    roomId: { in: expiredRoomIds },
                },
            }),

            // Delete rooms
            prisma.room.deleteMany({
                where: {
                    id: { in: expiredRoomIds },
                },
            }),
        ]);

        const charPerfDeleted = deleteResults[0].count;
        const speedDeleted = deleteResults[1].count;
        const membersDeleted = deleteResults[2].count;
        const roomsDeleted = deleteResults[3].count;

        result = {
            success: true,
            deletedRooms: roomsDeleted,
            deletedMembers: membersDeleted,
            deletedSpeeds: speedDeleted,
            deletedCharPerf: charPerfDeleted,
            duration: Date.now() - startTime,
        };

        logInfo(`Cleanup completed`, {
            rooms: roomsDeleted,
            members: membersDeleted,
            speeds: speedDeleted,
            charPerf: charPerfDeleted,
            duration: `${result.duration}ms`,
        });

        return result;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logError(`Cleanup failed: ${errorMsg}`, error);

        result.success = false;
        result.error = errorMsg;
        result.duration = Date.now() - startTime;

        return result;
    }
}

/**
 * Schedule cleanup to run periodically
 * Call this once on application startup
 */
export function scheduleCleanupTask(intervalMs: number = 60 * 60 * 1000) {
    // Run cleanup every hour by default
    const interval = setInterval(async () => {
        await cleanupExpiredRooms();
    }, intervalMs);

    // Return function to cancel the interval if needed
    return () => clearInterval(interval);
}

/**
 * Mark a room as expired (set expireAt to now or past)
 */
export async function expireRoom(roomId: string): Promise<void> {
    try {
        await prisma.room.update({
            where: { id: roomId },
            data: {
                expiresAt: new Date(),
                status: 'EXPIRED',
            },
        });
        logInfo(`Room ${roomId} marked as expired`);
    } catch (error) {
        logError(`Failed to expire room ${roomId}`, error);
        throw error;
    }
}

/**
 * Get count of expired rooms (for monitoring)
 */
export async function getExpiredRoomCount(): Promise<number> {
    try {
        return await prisma.room.count({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    } catch (error) {
        logError('Failed to count expired rooms', error);
        return 0;
    }
}
