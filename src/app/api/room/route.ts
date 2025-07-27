import { NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { createRoomHandler } from './handlers/create';
import { joinRoomHandler } from './handlers/join';
import { StartRoomHandler } from './handlers/start';
import { EndrollRoomHandler } from './handlers/endroll';
import { SpeedRoomHandler } from './handlers/speed';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Add some logging to debug
        console.log('API Request body:', body);
        console.log('Action:', body.action);
        
        switch (body.action) {
            case 'create':
                return createRoomHandler(body);
            case 'join':
                return joinRoomHandler(body);
            case 'start':
                return StartRoomHandler(body);
            case "endroll":
                return EndrollRoomHandler(body);
            case 'speed':
                return SpeedRoomHandler(body);
            default:
                console.log('Invalid action received:', body.action);
                throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        console.error('Route handler error:', error);
        return handleError(error);
    }
}