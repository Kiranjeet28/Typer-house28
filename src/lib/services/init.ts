/**
 * Application Initialization
 * Runs on server startup to initialize services
 */

import { scheduleCleanupTask, cleanupExpiredRooms } from '@/lib/services/roomCleanup';
import { logInfo, logError } from '@/lib/utils/logging';

let cleanupInterval: (() => void) | null = null;

/**
 * Initialize all background services
 * Call this once when the application starts
 */
export async function initializeBackgroundServices(): Promise<void> {
    try {
        logInfo('Initializing background services...');

        // Run initial cleanup
        logInfo('Running initial room cleanup...');
        const initialResult = await cleanupExpiredRooms();
        logInfo('Initial cleanup completed', {
            deletedRooms: initialResult.deletedRooms,
            duration: initialResult.duration,
        });

        // Schedule periodic cleanup (every hour)
        logInfo('Scheduling periodic room cleanup (every 1 hour)...');
        cleanupInterval = scheduleCleanupTask(60 * 60 * 1000);

        logInfo('✅ Background services initialized successfully');
    } catch (error) {
        logError('Failed to initialize background services', error);
        // Don't throw - app should continue even if initialization fails
    }
}

/**
 * Shutdown background services
 * Call this when the application is shutting down
 */
export async function shutdownBackgroundServices(): Promise<void> {
    try {
        logInfo('Shutting down background services...');

        if (cleanupInterval) {
            cleanupInterval();
            cleanupInterval = null;
        }

        logInfo('✅ Background services shut down');
    } catch (error) {
        logError('Error during background service shutdown', error);
    }
}
