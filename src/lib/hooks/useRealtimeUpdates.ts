/**
 * Client-side hook for real-time updates
 * Provides WebSocket-like functionality for live data updates
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getRoomSocket } from '@/lib/room/roomSocket';
import type { LivePlayer } from '@/lib/room/websocket-types';

interface RoomUpdate {
    type: 'room-status' | 'speed-update' | 'player-joined' | 'player-left' | 'room-deleted';
    roomId: string;
    data: any;
    timestamp: number;
}

interface UseRealTimeUpdatesOptions {
    roomId: string;
    enabled?: boolean;
}

/**
 * Hook for real-time room updates
 * Subscribes to the room WebSocket for live data.
 */
export function useRealTimeRoomUpdates(options: UseRealTimeUpdatesOptions) {
    const { roomId, enabled = true } = options;
    const { data: session } = useSession();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!enabled || !roomId || !session?.user?.id) return;
        const socket = getRoomSocket(roomId);
        return socket.subscribe((message) => {
            if (message.type === 'ROOM_STATE') {
                setPlayers(message.players);
                setLoading(false);
                setError(null);
            } else if (message.type === 'PLAYER_SPEED') {
                setPlayers((currentPlayers: LivePlayer[]) => currentPlayers.map((player) =>
                    player.id === message.userId ? { ...player, wpm: message.wpm } : player,
                ));
            } else if (message.type === 'PLAYER_JOINED') {
                setPlayers((currentPlayers: LivePlayer[]) => currentPlayers.some((player) => player.id === message.player.id)
                    ? currentPlayers.map((player) => player.id === message.player.id ? message.player : player)
                    : [...currentPlayers, message.player]);
            } else if (message.type === 'PLAYER_LEFT') {
                setPlayers((currentPlayers: LivePlayer[]) => currentPlayers.map((player) =>
                    player.id === message.userId ? { ...player, status: 'LEFT' } : player,
                ));
            } else if (message.type === 'ERROR' || message.type === 'CONNECTION_ERROR') {
                setError(message.message);
                setLoading(false);
            }
        });
    }, [enabled, roomId, session?.user?.id]);

    return {
        players,
        loading,
        error,
        refresh: () => undefined,
    };
}

/**
 * Hook for connection statistics
 * Shows number of active connections and rooms
 */
export function useConnectionStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/realtime', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.json();
            setStats(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats,
    };
}

/**
 * Hook to trigger manual cleanup
 */
export function useManualCleanup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);

    const triggerCleanup = useCallback(async () => {
        if (process.env.NODE_ENV !== 'development') {
            setError('Cleanup only available in development');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/realtime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'cleanup-now' }),
            });

            if (!response.ok) {
                throw new Error(`Failed: ${response.status}`);
            }

            const data = await response.json();
            setResult(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        triggerCleanup,
        loading,
        error,
        result,
    };
}
