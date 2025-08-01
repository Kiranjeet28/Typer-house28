import { prisma } from '@/lib/prisma';
import { RoomStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function joinRoomCheckHandler(body: { roomId: string }) {
    try {
        const { roomId } = body;
        const response = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (response && response.status === RoomStatus.IN_GAME) {
            return NextResponse.json(true);
        }
        return NextResponse.json(false);
    } catch (error) {
        console.error('joinRoomCheckHandler error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}