import { prisma } from '@/lib/prisma';
import { get } from '../schema';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/error';

export async function getHandler(body: any) {
    try {
        const result = get.safeParse(body);
        if (!result.success) {
            throw new AppError(400, 'Invalid data format');
        }

        const { roomId } = result.data;

        const room = await prisma.room.findFirst({
            where: { id: roomId },
        });

        if (!room) {
            throw new AppError(404, 'Room not found or has been deleted');
        }

        return room;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error('getHandler error:', error);
        throw new AppError(500, 'Failed to fetch room');
    }
}