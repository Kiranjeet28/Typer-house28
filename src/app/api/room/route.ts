import { NextRequest, NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { createRoomHandler } from './handlers/create';
import { joinRoomHandler } from './handlers/join';
import { StartRoomHandler } from './handlers/start';
import { EndrollRoomHandler } from './handlers/endroll';
import { SpeedRoomHandler,getSpeedsForRoom } from './handlers/speed';
import { joinRoomCheckHandler } from './handlers/checkJoin';
import { getHandler } from './handlers/get';
import characterPushHandler from './handlers/characterPush';
import { SpeedWpmHandler } from './handlers/speedWpm';

// Handle POST requests (your existing logic)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        
        switch (body.action) {
            case 'create':
                return createRoomHandler(body);
            case 'join':
                return joinRoomHandler(body);
            case 'start':
                return StartRoomHandler(body);
            case "endroll":
                return EndrollRoomHandler(body);
            case "speedWpm":
                return SpeedWpmHandler(body);
            case "charPerformance":
                return characterPushHandler(body);
            case "speed":
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

// NEW: Handle GET requests
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get("id");
        const action = searchParams.get("action") || "speed"; // Default to speed for backward compatibility
        
        
        if (!roomId) {
            throw new AppError(400, 'Missing room ID');
        }
        
        switch (action) {
            case "speed":
                return getSpeedsForRoom(roomId);
            case 'check-join':
                const checkJoinBody = { action: 'check-join', roomId };
                return joinRoomCheckHandler(checkJoinBody);
             case 'get':
                const getRoomBody = { action: 'get', roomId };
                const roomData = await getHandler(getRoomBody);
                return NextResponse.json(roomData);
            default:
                throw new AppError(400, 'Invalid GET action');
        }
    } catch (error) {
        console.error('GET Route handler error:', error);
        return handleError(error);
    }
}