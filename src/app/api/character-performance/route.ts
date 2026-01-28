// this api for handle the api request for character performance at fire and forget problem 
import { NextRequest, NextResponse } from 'next/server';
import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomId, userId } = body;

        if (!roomId || !userId) {
            return NextResponse.json(
                { error: 'Missing roomId or userId' },
                { status: 400 }
            );
        }

        await pushCharacterPerformance(roomId, userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Character performance push failed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}