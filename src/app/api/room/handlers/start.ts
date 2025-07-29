import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { startRoomSchema } from '../schema';

export async function StartRoomHandler(body: Request) {
    const result = startRoomSchema.safeParse(body);
     const { id: roomId } = result.success ? result.data : { id: undefined };
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


    if (!roomId) {
        return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    try {
        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                status: 'IN_GAME',
                codeValid : false,
             },
        });

        return NextResponse.json({ message: 'Game started', data: updatedRoom });
    } catch (error) {
        console.error('Start room error:', error);
        return NextResponse.json({ error: 'Could not start the game' }, { status: 500 });
    }
}
