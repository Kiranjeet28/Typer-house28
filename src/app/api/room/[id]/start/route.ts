import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomId = request.nextUrl.searchParams.get('id');
    // If using dynamic route, extract id from pathname:
    // const roomId = request.nextUrl.pathname.split('/').at(-2);

    if (!roomId) {
        return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    try {
        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: { status: 'IN_GAME' },
        });

        return NextResponse.json({ message: 'Game started', data: updatedRoom });
    } catch (error) {
        console.error('Start room error:', error);
        return NextResponse.json({ error: 'Could not start the game' }, { status: 500 });
    }
}
