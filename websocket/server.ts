import "dotenv/config";
import { decode, getToken } from "next-auth/jwt";
import { IncomingMessage } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { prisma } from "../src/lib/prisma";
import type { ClientMessage, LivePlayer } from "../src/lib/room/websocket-types";
import { roomManager } from "./roomManager";
const port = Number(process.env.PORT ?? process.env.WS_PORT ?? 3001);
const wss = new WebSocketServer({ port });

type AuthenticatedUser = { id: string; name: string };
type HealthSocket = WebSocket & { isAlive?: boolean };

async function authenticate(request: IncomingMessage): Promise<AuthenticatedUser | null> {
    const requestUrl = new URL(
        request.url ?? "/",
        `http://${request.headers.host ?? "localhost"}`,
    );
    const websocketToken = requestUrl.searchParams.get("token");
    const token = websocketToken
        ? await decode({
            token: websocketToken,
            secret: process.env.NEXTAUTH_SECRET!,
        })
        : await getToken({
            req: request as never,
            secret: process.env.NEXTAUTH_SECRET,
        });
    const userId = typeof token?.uid === "string" ? token.uid : token?.sub;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, username: true },
    });
    if (!user) return null;
    return { id: user.id, name: user.name ?? user.username ?? "Anonymous" };
}

function send(socket: WebSocket, message: object) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function isClientMessage(value: unknown): value is ClientMessage {
    if (!value || typeof value !== "object" || !("type" in value)) return false;
    const message = value as { type?: unknown; roomId?: unknown; wpm?: unknown };
    if (message.type === "JOIN_ROOM") return typeof message.roomId === "string" && message.roomId.length > 0;
    if (message.type === "WPM_UPDATE") return Number.isInteger(message.wpm) && Number(message.wpm) >= 0 && Number(message.wpm) <= 300;
    return message.type === "LEAVE_ROOM";
}

wss.on("connection", (socket, request) => {
    const healthSocket = socket as HealthSocket;
    healthSocket.isAlive = true;
    healthSocket.on("pong", () => { healthSocket.isAlive = true; });

    let authenticated = false;
    let closed = false;

    void authenticate(request).then(async (user) => {
        if (!user || closed) {
            socket.close(1008, "Authentication required");
            return;
        }
        authenticated = true;

        socket.on("message", async (rawMessage) => {
            if (!authenticated) return;
            let message: unknown;
            try {
                message = JSON.parse(rawMessage.toString());
            } catch {
                send(socket, { type: "ERROR", message: "Invalid message." });
                return;
            }
            if (!isClientMessage(message)) {
                send(socket, { type: "ERROR", message: "Invalid message." });
                return;
            }

            if (message.type === "JOIN_ROOM") {
                const member = await prisma.roomMember.findUnique({
                    where: { roomId_userId: { roomId: message.roomId, userId: user.id } },
                });
                if (!member || member.status === "LEFT") {
                    send(socket, { type: "ERROR", message: "You are not a member of this room." });
                    socket.close(1008, "Not a room member");
                    return;
                }

                const player: LivePlayer = { id: user.id, name: user.name, wpm: 0, status: "ACTIVE" };
                const state = roomManager.join(message.roomId, player, socket);
                send(socket, { type: "ROOM_STATE", players: state.players });
                if (state.joinedPlayer) {
                    roomManager.broadcast(message.roomId, { type: "PLAYER_JOINED", player: state.joinedPlayer }, socket);
                }
                return;
            }

            if (message.type === "WPM_UPDATE") {
                const update = roomManager.updateWpm(socket, message.wpm);
                if (update) roomManager.broadcast(update.roomId, {
                    type: "PLAYER_SPEED",
                    userId: update.userId,
                    wpm: update.wpm,
                }, socket);
                return;
            }

            const left = roomManager.leave(socket);
            if (left) {
                roomManager.broadcast(left.roomId, { type: "PLAYER_LEFT", userId: left.userId });
            }
            socket.close(1000, "Left room");
        });
    }).catch(() => socket.close(1011, "Authentication failed"));

    socket.on("close", () => {
        closed = true;
        const left = roomManager.leave(socket);
        if (left) roomManager.broadcast(left.roomId, { type: "PLAYER_LEFT", userId: left.userId });
    });
});

const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
        const healthSocket = socket as HealthSocket;
        if (healthSocket.isAlive === false) {
            healthSocket.terminate();
            continue;
        }
        healthSocket.isAlive = false;
        healthSocket.ping();
    }
}, 30000);

wss.on("close", () => clearInterval(heartbeat));
console.log(`WebSocket server listening on port ${port}`);