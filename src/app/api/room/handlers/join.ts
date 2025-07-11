import { joinRoomSchema, RoomError } from '../schema';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function joinRoomHandler(body: object) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    error: 'Authentication required',
                    code: 'UNAUTHORIZED',
                },
                { status: 401 }
            );
        }

        const validationResult = joinRoomSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid input',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const { joinCode } = validationResult.data;

        const room = await prisma.room.findUnique({
            where: { joinCode },
            include: {
                creator: {
                    select: { id: true, name: true, username: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true },
                        },
                    },
                },
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });

        if (!room) {
            throw new RoomError('Room not found', 'ROOM_NOT_FOUND', 404);
        }

        if (room.expiresAt < new Date()) {
            throw new RoomError('Room has expired', 'ROOM_EXPIRED', 400);
        }

        if (room._count.members >= room.maxPlayers) {
            throw new RoomError('Room is full', 'ROOM_FULL', 400);
        }

        if (room.status === 'FINISHED') {
            throw new RoomError('Room is finished', 'ROOM_FINISHED', 400);
        }

        if (room.status === 'IN_GAME') {
            throw new RoomError('Room is currently in game', 'ROOM_IN_GAME', 400);
        }

        const existingMember = room.members.find(
            (member) => member.userId === session.user.id
        );

        if (existingMember) {
            if (existingMember.status === 'LEFT') {
                await prisma.roomMember.update({
                    where: { id: existingMember.id },
                    data: { status: 'JOINED', joinedAt: new Date() },
                });
            } else {
                throw new RoomError(
                    'You are already in this room',
                    'ALREADY_IN_ROOM',
                    400
                );
            }
        } else {
            await prisma.roomMember.create({
                data: {
                    roomId: room.id,
                    userId: session.user.id,
                    role: 'PLAYER',
                    status: 'JOINED',
                },
            });
        }

        const updatedRoom = await prisma.room.findUnique({
            where: { id: room.id },
            include: {
                creator: {
                    select: { id: true, name: true, username: true },
                },
                members: {
                    where: {
                        status: {
                            not: 'LEFT',
                        },
                    },
                    include: {
                        user: {
                            select: { id: true, name: true, username: true },
                        },
                    },
                },
                _count: {
                    select: { members: true },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedRoom,
                message: 'Successfully joined room',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Join room error:', error);

        if (error instanceof RoomError) {
            return NextResponse.json(
                {
                    error: error.message,
                    code: error.code,
                },
                { status: error.statusCode }
            );
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            },
            { status: 500 }
        );
    }
}
