import type { LivePlayer } from "../src/lib/room/websocket-types";

export type RoomSocket = {
    send(data: string): void;
    readyState?: number;
};

type Connection = {
    roomId: string;
    userId: string;
    socket: RoomSocket;
};

type RoomState = {
    players: Map<string, LivePlayer>;
    connections: Set<RoomSocket>;
};

export class RoomManager {
    private readonly rooms = new Map<string, RoomState>();
    private readonly connections = new Map<RoomSocket, Connection>();

    join(roomId: string, player: LivePlayer, socket: RoomSocket) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = { players: new Map(), connections: new Set() };
            this.rooms.set(roomId, room);
        }

        const previousConnection = Array.from(this.connections.values()).find(
            (connection) => connection.roomId === roomId && connection.userId === player.id,
        );
        if (previousConnection && previousConnection.socket !== socket) {
            this.connections.delete(previousConnection.socket);
            room.connections.delete(previousConnection.socket);
            previousConnection.socket.send(JSON.stringify({
                type: "ERROR",
                message: "This room connection was replaced.",
            }));
            previousConnection.socket.send(JSON.stringify({ type: "PLAYER_LEFT", userId: player.id }));
        }

        const previousPlayer = room.players.get(player.id);
        room.players.set(player.id, player);
        room.connections.add(socket);
        this.connections.set(socket, { roomId, userId: player.id, socket });

        return {
            players: Array.from(room.players.values()),
            joinedPlayer: previousPlayer?.status === "ACTIVE" ? null : player,
        };
    }

    updateWpm(socket: RoomSocket, wpm: number) {
        const connection = this.connections.get(socket);
        if (!connection) return null;

        const room = this.rooms.get(connection.roomId);
        const player = room?.players.get(connection.userId);
        if (!room || !player || player.status !== "ACTIVE") return null;

        player.wpm = wpm;
        return { roomId: connection.roomId, userId: connection.userId, wpm };
    }

    leave(socket: RoomSocket) {
        const connection = this.connections.get(socket);
        if (!connection) return null;

        this.connections.delete(socket);
        const room = this.rooms.get(connection.roomId);
        room?.connections.delete(socket);
        const player = room?.players.get(connection.userId);
        if (player) player.status = "LEFT";

        if (room && room.connections.size === 0) this.rooms.delete(connection.roomId);
        return { roomId: connection.roomId, userId: connection.userId };
    }

    broadcast(roomId: string, message: object, except?: RoomSocket) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const payload = JSON.stringify(message);
        for (const socket of room.connections) {
            if (socket !== except && socket.readyState !== 3) socket.send(payload);
        }
    }
}

export const roomManager = new RoomManager();