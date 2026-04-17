/**
 * Real-time Updates API Route
 * Endpoint for WebSocket events and real-time data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConnectionStats } from '@/lib/services/realtimeUpdates';
import { getExpiredRoomCount } from '@/lib/services/roomCleanup';
import { logInfo, logError } from '@/lib/utils/logging';
import { AppError, handleError } from '@/lib/error';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'get-stats': {
                const stats = getConnectionStats();
                const expiredRooms = await getExpiredRoomCount();

                return NextResponse.json({
                    success: true,
                    data: {
                        connections: stats,
                        expiredRooms,
                        timestamp: new Date().toISOString(),
                    },
                });
            }

            case 'cleanup-now': {
                // Only allow in development or with auth
                if (process.env.NODE_ENV !== 'development') {
                    throw new AppError(403, 'Cleanup endpoint only available in development');
                }

                const { cleanupExpiredRooms } = await import('@/lib/services/roomCleanup');
                const result = await cleanupExpiredRooms();

                logInfo('Manual cleanup triggered', result);

                return NextResponse.json({
                    success: true,
                    data: result,
                });
            }

            default:
                throw new AppError(400, `Invalid action: ${action}`);
        }
    } catch (error) {
        logError('Real-time updates API error', error);
        return handleError(error);
    }
}

export async function GET(request: NextRequest) {
    try {
        const stats = getConnectionStats();

        // Cache for 5 seconds
        const response = NextResponse.json({
            success: true,
            data: stats,
        });
        response.headers.set('Cache-Control', 'public, max-age=5');

        return response;
    } catch (error) {
        logError('Failed to get real-time stats', error);
        return handleError(error);
    }
}
