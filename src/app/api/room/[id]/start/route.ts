import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomId = params.id;

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
