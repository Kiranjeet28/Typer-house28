import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { createRoomSchema, RoomError } from '../schema';
import { prisma } from '@/lib/prisma';
import { generateJoinCode, getRoomExpiration } from '../utils';
import { AppError } from '@/lib/error';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function createRoomHandler(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new AppError(401, 'Authentication required');
        }

        const result = createRoomSchema.safeParse(request);

        if (!result.success) {
            throw new AppError(400, result.error.errors[0].message);
        }

        const data = result.data;

        const activeRoomsCount = await prisma.room.count({
            where: {
                creatorId: session.user.id,
                status: {
                    in: ['WAITING', 'IN_GAME'],
                },
            },
        });

        if (activeRoomsCount >= 3) {
            throw new RoomError(
                'You can only have 3 active rooms at a time',
                'ROOM_LIMIT_EXCEEDED',
                400
            );
        }

        // Generate unique join code
        let joinCode: string;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            joinCode = generateJoinCode();
            const existingRoom = await prisma.room.findUnique({
                where: { joinCode },
            });
            if (!existingRoom) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts === maxAttempts) {
            throw new RoomError(
                'Failed to generate unique join code',
                'JOIN_CODE_GENERATION_FAILED',
                500
            );
        }

        // Create room with transaction
        const room = await prisma.$transaction(async (tx) => {
            const newRoom = await tx.room.create({
                data: {
                    name: data.name,
                    description: data.description,
                    creatorId: session.user.id as string,
                    joinCode,
                    maxPlayers: data.maxPlayers,
                    isPrivate: data.isPrivate,
                    gameMode: data.gameMode,
                    textLength: data.textLength,
                    timeLimit: data.timeLimit,
                    customText: data.customText,
                    expiresAt: getRoomExpiration(),
                },
            });

            if (!session.user.id) {
                throw new AppError(401, 'Authentication required');
            }
            await tx.roomMember.create({
                data: {
                    roomId: newRoom.id,
                    userId: session.user.id as string,
                    role: 'CREATOR',
                    status: 'JOINED',
                },
            });

            return newRoom;
        });

        return NextResponse.json({
            success: true,
            data: {
                roomId: room.id,
                joinCode: room.joinCode,
            },
            message: 'Room created successfully',
        }, { status: 201 });

    } catch (error) {
        console.error('Create room error:', error);

        if (error instanceof RoomError || error instanceof AppError) {
            return NextResponse.json({
                error: error.message,
            }, { status: error.statusCode });
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation error',
                code: 'VALIDATION_ERROR',
                details: error.errors,
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
        }, { status: 500 });
    }
}

// // Get Room Handler
// export async function getRoomHandler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'GET') {
//         return res.status(405).json({
//             error: 'Method not allowed',
//             code: 'METHOD_NOT_ALLOWED'
//         });
//     }

//     try {
//         const session = await getServerSession(req, res, authOptions);
//         if (!session?.user?.id) {
//             return res.status(401).json({
//                 error: 'Authentication required',
//                 code: 'UNAUTHORIZED'
//             });
//         }

//         const { roomId } = req.query;

//         if (!roomId || typeof roomId !== 'string') {
//             return res.status(400).json({
//                 error: 'Room ID is required',
//                 code: 'MISSING_ROOM_ID'
//             });
//         }

//         const room = await prisma.room.findUnique({
//             where: { id: roomId },
//             include: {
//                 creator: {
//                     select: {
//                         id: true,
//                         name: true,
//                         username: true,
//                     }
//                 },
//                 members: {
//                     where: {
//                         status: {
//                             not: 'LEFT'
//                         }
//                     },
//                     include: {
//                         user: {
//                             select: {
//                                 id: true,
//                                 name: true,
//                                 username: true,
//                             }
//                         }
//                     }
//                 },
//                 _count: {
//                     select: {
//                         members: true
//                     }
//                 }
//             }
//         });

//         if (!room) {
//             throw new RoomError(
//                 'Room not found',
//                 'ROOM_NOT_FOUND',
//                 404
//             );
//         }

//         // Check if user has access to this room
//         const isCreator = room.creatorId === session.user.id;
//         const isMember = room.members.some(member => member.userId === session.user.id);

//         if (room.isPrivate && !isCreator && !isMember) {
//             throw new RoomError(
//                 'Access denied to private room',
//                 'PRIVATE_ROOM_ACCESS_DENIED',
//                 403
//             );
//         }

//         return res.status(200).json({
//             success: true,
//             data: room
//         });

//     } catch (error) {
//         console.error('Get room error:', error);

//         if (error instanceof RoomError) {
//             return res.status(error.statusCode).json({
//                 error: error.message,
//                 code: error.code
//             });
//         }

//         return res.status(500).json({
//             error: 'Internal server error',
//             code: 'INTERNAL_ERROR'
//         });
//     }
// }