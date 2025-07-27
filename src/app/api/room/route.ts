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
        switch (body.action) {
            case 'create':
                return createRoomHandler(body);
            case 'join':
                return joinRoomHandler(body);
            case 'start':
                return StartRoomHandler(body);
            case 'endroll':
                return EndrollRoomHandler(body);
            case 'speed':
                return SpeedRoomHandler(body);
            default:
                throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        return handleError(error);
    }
}