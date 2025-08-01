import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();

const generateRoomCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export interface CreateRoomOptions {
    name: string;
    description?: string;
    creatorId: string;
    maxPlayers?: number;
    isPrivate?: boolean;
    gameMode?: 'SPEED_TEST' | 'ACCURACY_TEST' | 'SURVIVAL' | 'CUSTOM_TEXT';
    textLength?: 'SHORT' | 'MEDIUM' | 'LONG' | 'MARATHON';
    timeLimit?: number;
    customText?: string;
    expirationMinutes?: number; // Default 60 minutes
}

export interface JoinRoomOptions {
    joinCode: string;
    userId: string;
}

export class RoomManager {
    /**
     * Create a new room with expiring join code
     */
    static async createRoom(options: CreateRoomOptions) {
        const {
            name,
            description,
            creatorId,
            maxPlayers = 4,
            isPrivate = false,
            gameMode = 'SPEED_TEST',
            textLength = 'MEDIUM',
            timeLimit,
            customText,
            expirationMinutes = 60
        } = options;

        // Generate unique join code
        let joinCode: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            joinCode = generateRoomCode();
            const existingRoom = await prisma.room.findUnique({
                where: { joinCode }
            });

            if (!existingRoom) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique room code');
        }

        // Set expiration time
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

        try {
            const room = await prisma.room.create({
                data: {
                    name,
                    description,
                    creatorId,
                    joinCode: joinCode!,
                    maxPlayers,
                    isPrivate,
                    gameMode,
                    textLength,
                    timeLimit,
                    customText,
                    expiresAt,
                    members: {
                        create: {
                            userId: creatorId,
                            role: 'CREATOR',
                            status: 'JOINED'
                        }
                    }
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    image: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                room,
                joinCode: joinCode!,
                expiresAt
            };
        } catch (error) {
            console.error('Error creating room:', error);
            throw new Error('Failed to create room');
        }
    }

    /**
     * Join an existing room using join code
     */
    static async joinRoom(options: JoinRoomOptions) {
        const { joinCode, userId } = options;

        try {
            // Find room and check if it's valid
            const room = await prisma.room.findUnique({
                where: { joinCode },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    image: true
                                }
                            }
                        }
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            });

            if (!room) {
                return {
                    success: false,
                    error: 'Room not found'
                };
            }

            // Check if room has expired
            if (new Date() > room.expiresAt) {
                // Update room status to expired
                await prisma.room.update({
                    where: { id: room.id },
                    data: { status: 'EXPIRED' }
                });

                return {
                    success: false,
                    error: 'Room has expired'
                };
            }

            // Check if room is full
            if (room.members.length >= room.maxPlayers) {
                return {
                    success: false,
                    error: 'Room is full'
                };
            }

            // Check if user is already in the room
            const existingMember = room.members.find(member => member.userId === userId);
            if (existingMember) {
                return {
                    success: false,
                    error: 'You are already in this room'
                };
            }

            // Check if room is in a joinable state
            if (room.status !== 'WAITING') {
                return {
                    success: false,
                    error: 'Room is not accepting new players'
                };
            }

            // Add user to room
            await prisma.roomMember.create({
                data: {
                    roomId: room.id,
                    userId,
                    role: 'PLAYER',
                    status: 'JOINED'
                }
            });

            // Get updated room data
            const updatedRoom = await prisma.room.findUnique({
                where: { id: room.id },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    image: true
                                }
                            }
                        }
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            });

            return {
                success: true,
                room: updatedRoom
            };
        } catch (error) {
            console.error('Error joining room:', error);
            throw new Error('Failed to join room');
        }
    }

    /**
     * Get room details by join code
     */
    static async getRoomByCode(joinCode: string) {
        try {
            const room = await prisma.room.findUnique({
                where: { joinCode },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    image: true
                                }
                            }
                        }
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    games: {
                        orderBy: { gameNumber: 'desc' },
                        take: 1,
                        include: {
                            results: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            username: true,
                                            image: true
                                        }
                                    }
                                },
                                orderBy: { position: 'asc' }
                            }
                        }
                    }
                }
            });

            if (!room) {
                return { success: false, error: 'Room not found' };
            }

            // Check if room has expired
            if (new Date() > room.expiresAt) {
                await prisma.room.update({
                    where: { id: room.id },
                    data: { status: 'EXPIRED' }
                });

                return { success: false, error: 'Room has expired' };
            }

            return { success: true, room };
        } catch (error) {
            console.error('Error getting room:', error);
            return { success: false, error: 'Failed to get room' };
        }
    }

    /**
     * Clean up expired rooms
     */
    static async cleanupExpiredRooms() {
        try {
            const expiredRooms = await prisma.room.updateMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    },
                    status: {
                        not: 'EXPIRED'
                    }
                },
                data: {
                    status: 'EXPIRED'
                }
            });

            console.log(`Marked ${expiredRooms.count} rooms as expired`);
            return expiredRooms.count;
        } catch (error) {
            console.error('Error cleaning up expired rooms:', error);
            return 0;
        }
    }

    /**
     * Extend room expiration
     */
    static async extendRoomExpiration(roomId: string, additionalMinutes: number = 30) {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId }
            });

            if (!room) {
                return { success: false, error: 'Room not found' };
            }

            const newExpirationTime = new Date(room.expiresAt);
            newExpirationTime.setMinutes(newExpirationTime.getMinutes() + additionalMinutes);

            const updatedRoom = await prisma.room.update({
                where: { id: roomId },
                data: { expiresAt: newExpirationTime }
            });

            return { success: true, room: updatedRoom };
        } catch (error) {
            console.error('Error extending room expiration:', error);
            return { success: false, error: 'Failed to extend room expiration' };
        }
    }

    /**
     * Get user's active rooms
     */
    static async getUserRooms(userId: string) {
        try {
            const rooms = await prisma.room.findMany({
                where: {
                    members: {
                        some: {
                            userId: userId
                        }
                    },
                    status: {
                        in: ['WAITING', 'IN_GAME']
                    },
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    image: true
                                }
                            }
                        }
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return { success: true, rooms };
        } catch (error) {
            console.error('Error getting user rooms:', error);
            return { success: false, error: 'Failed to get user rooms' };
        }
    }

    /**
     * Leave a room
     */
    static async leaveRoom(roomId: string, userId: string) {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    members: true
                }
            });

            if (!room) {
                return { success: false, error: 'Room not found' };
            }

            const member = room.members.find(m => m.userId === userId);
            if (!member) {
                return { success: false, error: 'User not in room' };
            }

            // If user is the creator and there are other members, transfer ownership
            if (room.creatorId === userId && room.members.length > 1) {
                const newCreator = room.members.find(m => m.userId !== userId);
                if (newCreator) {
                    await prisma.room.update({
                        where: { id: roomId },
                        data: { creatorId: newCreator.userId }
                    });

                    await prisma.roomMember.update({
                        where: { id: newCreator.id },
                        data: { role: 'CREATOR' }
                    });
                }
            }

            // Remove user from room
            await prisma.roomMember.delete({
                where: { id: member.id }
            });

            // If no members left, mark room as finished
            if (room.members.length === 1) {
                await prisma.room.update({
                    where: { id: roomId },
                    data: { status: 'FINISHED' }
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error leaving room:', error);
            return { success: false, error: 'Failed to leave room' };
        }
    }
}