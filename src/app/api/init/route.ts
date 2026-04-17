/**
 * Server initialization endpoint
 * Called once to initialize background services
 */

import { NextResponse } from 'next/server';
import { initializeBackgroundServices } from '@/lib/services/init';
import { logInfo } from '@/lib/utils/logging';

let initialized = false;

export async function GET() {
    if (initialized) {
        return NextResponse.json({ message: 'Services already initialized' });
    }

    try {
        await initializeBackgroundServices();
        initialized = true;
        logInfo('✅ Server initialization complete');
        return NextResponse.json({
            success: true,
            message: 'Background services initialized'
        });
    } catch (error) {
        logInfo('❌ Server initialization failed', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
