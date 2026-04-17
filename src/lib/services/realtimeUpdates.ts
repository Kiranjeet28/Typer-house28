/**
 * WebSocket Real-time Updates Service
 * Manages real-time communication for room updates, speed changes, etc.
 */

interface RoomUpdate {
    type: 'room-status' | 'speed-update' | 'player-joined' | 'player-left' | 'room-deleted';
    roomId: string;
    data: any;
    timestamp: number;
}

interface ClientConnection {
    id: string;
    roomId: string;
    userId: string;
    timestamp: number;
}

/**
 * In-memory store for active connections
 * In production, use Redis for multi-server setups
 */
class RealTimeUpdateManager {
    private connections: Map<string, ClientConnection> = new Map();
    private subscribers: Map<string, Set<string>> = new Map();

    /**
     * Register a new client connection
     */
    registerConnection(clientId: string, roomId: string, userId: string): void {
        const connection: ClientConnection = {
            id: clientId,
            roomId,
            userId,
            timestamp: Date.now(),
        };
        this.connections.set(clientId, connection);

        // Add to room subscribers
        if (!this.subscribers.has(roomId)) {
            this.subscribers.set(roomId, new Set());
        }
        this.subscribers.get(roomId)!.add(clientId);

        console.log(`[WS] Client ${clientId} connected to room ${roomId}`);
    }

    /**
     * Unregister a client connection
     */
    unregisterConnection(clientId: string): void {
        const connection = this.connections.get(clientId);
        if (connection) {
            const subscribers = this.subscribers.get(connection.roomId);
            if (subscribers) {
                subscribers.delete(clientId);
            }
            this.connections.delete(clientId);
            console.log(`[WS] Client ${clientId} disconnected`);
        }
    }

    /**
     * Get all clients in a room
     */
    getRoomClients(roomId: string): string[] {
        return Array.from(this.subscribers.get(roomId) || []);
    }

    /**
     * Get all rooms with active clients
     */
    getActiveRooms(): string[] {
        return Array.from(this.subscribers.keys()).filter(
            (roomId) => (this.subscribers.get(roomId)?.size ?? 0) > 0
        );
    }

    /**
     * Get connection count for a room
     */
    getRoomConnectionCount(roomId: string): number {
        return this.subscribers.get(roomId)?.size ?? 0;
    }

    /**
     * Get total active connections
     */
    getTotalConnections(): number {
        return this.connections.size;
    }

    /**
     * Broadcast update to all clients in a room
     * (actual broadcasting depends on WebSocket implementation)
     */
    async broadcastToRoom(update: RoomUpdate): Promise<void> {
        const clientIds = this.getRoomClients(update.roomId);
        console.log(
            `[WS] Broadcasting "${update.type}" to ${clientIds.length} clients in room ${update.roomId}`
        );
        // Implementation depends on WebSocket library (Socket.io, ws, etc.)
    }

    /**
     * Broadcast update to all clients
     */
    async broadcastToAll(update: RoomUpdate): Promise<void> {
        const rooms = this.getActiveRooms();
        console.log(`[WS] Broadcasting to ${this.connections.size} clients across ${rooms.length} rooms`);
        // Implementation depends on WebSocket library
    }
}

// Singleton instance
export const realtimeManager = new RealTimeUpdateManager();

/**
 * Create room update message
 */
export function createRoomUpdate(
    type: RoomUpdate['type'],
    roomId: string,
    data: any
): RoomUpdate {
    return {
        type,
        roomId,
        data,
        timestamp: Date.now(),
    };
}

/**
 * Broadcast room status change (WAITING -> IN_GAME -> FINISHED)
 */
export async function broadcastRoomStatusUpdate(
    roomId: string,
    status: 'WAITING' | 'IN_GAME' | 'FINISHED' | 'EXPIRED'
): Promise<void> {
    const update = createRoomUpdate('room-status', roomId, { status });
    await realtimeManager.broadcastToRoom(update);
}

/**
 * Broadcast speed/WPM update for a player
 */
export async function broadcastSpeedUpdate(
    roomId: string,
    userId: string,
    wpm: number,
    correctWords: number
): Promise<void> {
    const update = createRoomUpdate('speed-update', roomId, {
        userId,
        wpm,
        correctWords,
    });
    await realtimeManager.broadcastToRoom(update);
}

/**
 * Broadcast player joined event
 */
export async function broadcastPlayerJoined(
    roomId: string,
    userId: string,
    userName: string
): Promise<void> {
    const update = createRoomUpdate('player-joined', roomId, {
        userId,
        userName,
    });
    await realtimeManager.broadcastToRoom(update);
}

/**
 * Broadcast player left event
 */
export async function broadcastPlayerLeft(
    roomId: string,
    userId: string,
    userName: string
): Promise<void> {
    const update = createRoomUpdate('player-left', roomId, {
        userId,
        userName,
    });
    await realtimeManager.broadcastToRoom(update);
}

/**
 * Broadcast room deleted event
 */
export async function broadcastRoomDeleted(roomId: string): Promise<void> {
    const update = createRoomUpdate('room-deleted', roomId, {});
    await realtimeManager.broadcastToRoom(update);
}

/**
 * Get connection statistics
 */
export function getConnectionStats() {
    return {
        totalConnections: realtimeManager.getTotalConnections(),
        activeRooms: realtimeManager.getActiveRooms().length,
        rooms: Array.from(realtimeManager.getActiveRooms()).map((roomId) => ({
            roomId,
            clients: realtimeManager.getRoomConnectionCount(roomId),
        })),
    };
}
