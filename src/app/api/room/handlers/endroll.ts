import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { endrollRoomSchema, RoomError } from '@/app/api/room/schema';
import { authOptions } from "@/lib/auth";

export async function EndrollRoomHandler(body: any) {
    
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

        // Now perform the original query
        let room;
        try {
            room = await prisma.room.findUniqueOrThrow({
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
                            // Only include members where the user exists
                            user: {}
                        },
                        select: {
                            userId: true,
                            role: true,
                            status: true,
                            user: {
                                select: {
                                    name: true,
                                    username: true,
                                },
                            },
                        },
                    }
                },
            });
        } catch (prismaError: any) {
            if (prismaError.name === 'NotFoundError') {
                throw new RoomError('Room not found', 'ROOM_NOT_FOUND', 404);
            }
            throw prismaError;
        }

        // No longer need this filter since we're filtering at the database level
        // room.members = room.members.filter((member: any) => member.user !== null);

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