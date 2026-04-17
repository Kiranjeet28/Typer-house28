/**
 * Client-side hook for real-time updates
 * Provides WebSocket-like functionality for live data updates
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface RoomUpdate {
    type: 'room-status' | 'speed-update' | 'player-joined' | 'player-left' | 'room-deleted';
    roomId: string;
    data: any;
    timestamp: number;
}

interface UseRealTimeUpdatesOptions {
    roomId: string;
    enabled?: boolean;
    pollInterval?: number; // milliseconds between polls
}

/**
 * Hook for real-time room updates
 * Polls the speed endpoint for live data
 */
export function useRealTimeRoomUpdates(options: UseRealTimeUpdatesOptions) {
    const { roomId, enabled = true, pollInterval = 1000 } = options;
    const { data: session } = useSession();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const fetchUpdate = useCallback(async () => {
        if (!roomId || !enabled || !session?.user?.id) return;

        try {
            setError(null);

            const response = await fetch(`/api/room?id=${roomId}&action=speed`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.json();

            // Only update if data changed
            const newTimestamp = Date.now();
            if (JSON.stringify(data) !== JSON.stringify(players)) {
                setPlayers(data || []);
                lastUpdateRef.current = newTimestamp;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [roomId, enabled, session?.user?.id, players]);

    // Set up polling
    useEffect(() => {
        if (!enabled || !roomId) {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
            return;
        }

        // Fetch immediately
        fetchUpdate();

        // Set up polling interval
        pollTimerRef.current = setInterval(fetchUpdate, pollInterval);

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [enabled, roomId, pollInterval, fetchUpdate]);

    return {
        players,
        loading,
        error,
        refresh: fetchUpdate,
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
