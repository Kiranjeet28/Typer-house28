"use client";

import type { ClientMessage, ServerMessage } from "./websocket-types";

type Listener = (message: ServerMessage) => void;

class RoomSocket {
    private socket: WebSocket | null = null;
    private listeners = new Set<Listener>();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private shouldReconnect = true;
    private pendingWpm: ClientMessage | null = null;

    constructor(private readonly roomId: string) { }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        this.shouldReconnect = true;
        this.connect();
        return () => {
            this.listeners.delete(listener);
            if (this.listeners.size === 0) this.disconnect();
        };
    }

    send(message: ClientMessage) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else if (message.type === "WPM_UPDATE") {
            this.pendingWpm = message;
        }
    }

    private connect() {
        if (!this.shouldReconnect || this.socket || typeof window === "undefined") return;
        const configuredUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        const url = configuredUrl ?? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:3001`;
        const socket = new WebSocket(url);
        this.socket = socket;

        socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.send({ type: "JOIN_ROOM", roomId: this.roomId });
            if (this.pendingWpm) {
                const pendingWpm = this.pendingWpm;
                this.pendingWpm = null;
                this.send(pendingWpm);
            }
        };
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as ServerMessage;
                this.listeners.forEach((listener) => listener(message));
            } catch {
                this.emit({ type: "CONNECTION_ERROR", message: "Invalid server message." });
            }
        };
        socket.onerror = () => this.emit({ type: "CONNECTION_ERROR", message: "WebSocket connection error." });
        socket.onclose = () => {
            this.socket = null;
            if (this.shouldReconnect) this.scheduleReconnect();
        };
    }

    private scheduleReconnect() {
        if (this.reconnectTimer || this.reconnectAttempts >= 5) return;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
        this.reconnectAttempts += 1;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    private disconnect() {
        this.shouldReconnect = false;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
        if (this.socket?.readyState === WebSocket.OPEN) this.send({ type: "LEAVE_ROOM" });
        this.socket?.close();
        this.socket = null;
    }

    private emit(message: ServerMessage) {
        this.listeners.forEach((listener) => listener(message));
    }
}

const sockets = new Map<string, RoomSocket>();

export function getRoomSocket(roomId: string) {
    let roomSocket = sockets.get(roomId);
    if (!roomSocket) {
        roomSocket = new RoomSocket(roomId);
        sockets.set(roomId, roomSocket);
    }
    return roomSocket;
}