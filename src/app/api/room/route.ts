import { NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { createRoomHandler } from './handlers/create';
import { joinRoomHandler } from './handlers/join';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.action === "create") {
            return createRoomHandler(body);
        } else if (body.action === "join") {
            return joinRoomHandler(body);
        } else {
            throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        return handleError(error);
    }
}