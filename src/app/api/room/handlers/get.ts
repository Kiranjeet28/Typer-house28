import { prisma } from '@/lib/prisma';
import { get } from '../schema';
import { NextResponse } from 'next/server';

export async function getHandler(body: any) {
    try {
        const result = get.safeParse(body);
        if (!result.success) {
            throw new Error('Invalid data format');
        }
        
        const { roomId } = result.data;
        
        const room = await prisma.room.findFirst({
            where: { id: roomId },
        });

        if (!room) {
            throw new Error('Room not found');
        }

        return room;
    } catch (error) {
        console.error('getHandler error:', error);
        throw error; // Re-throw to be handled by the route handler
    }
}