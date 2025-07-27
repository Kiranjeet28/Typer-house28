import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { endrollRoomSchema, RoomError } from '@/app/api/room/schema';
import { authOptions } from "@/lib/auth";

export async function EndrollRoomHandler(body: any) {
    console.log('EndrollRoomHandler received body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body || {}));
    
    const result = endrollRoomSchema.safeParse(body);
    
    if (!result.success) {
        console.error('Schema validation failed:', result.error.errors);
        return NextResponse.json(
            {
                error: 'Invalid request data',
                code: 'INVALID_REQUEST',
                details: result.error.errors,
                receivedData: body,
            },
            { status: 400 }
        );
    }
    
    const { id: roomId } = result.data;
    console.log('Validated roomId:', roomId);
    
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

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
                members: {
                    where: {
                        status: {
                            not: 'LEFT',
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
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

        // Check access if private room
        const isCreator = room.creatorId === session.user.id;
        const isMember = room.members.some((m) => m.userId === session.user.id);

        if (room.isPrivate && !isCreator && !isMember) {
            return NextResponse.json(
                {
                    error: 'Access denied to private room',
                    code: 'PRIVATE_ROOM_ACCESS_DENIED',
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: room,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get Room Error:', error);

        if (error instanceof RoomError) {
            return NextResponse.json(
                {
                    error: error.message,
                    code: error.code,
                },
                { status: error.statusCode }
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