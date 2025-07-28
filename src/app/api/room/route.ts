import { NextRequest, NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { createRoomHandler } from './handlers/create';
import { joinRoomHandler } from './handlers/join';
import { StartRoomHandler } from './handlers/start';
import { EndrollRoomHandler } from './handlers/endroll';
import { SpeedRoomHandler } from './handlers/speed';

// Handle POST requests (your existing logic)
export async function POST(request: NextRequest) {
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
                // Pass the request object for header access
                return SpeedRoomHandler(request, body);
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
        
        console.log('GET Request - roomId:', roomId, 'action:', action);
        
        if (!roomId) {
            throw new AppError(400, 'Missing room ID');
        }
        
        switch (action) {
            case 'speed':
                // Create a body-like object for the speed handler
                const speedBody = { action: 'speed', roomId };
                return SpeedRoomHandler(request, speedBody);
            
            // You can add more GET actions here in the future
            // case 'room-info':
            //     return getRoomInfoHandler(roomId);
            
            default:
                throw new AppError(400, 'Invalid GET action');
        }
    } catch (error) {
        console.error('GET Route handler error:', error);
        return handleError(error);
    }
}