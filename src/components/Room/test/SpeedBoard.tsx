// src/components/Room/test/SpeedBoard.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import { useSession } from "next-auth/react";

type UserStatus = "ACTIVE" | "LEFT";

type PlayerSpeed = {
    id?: string; // Add unique identifier for better tracking
    name: string;
    wpm: number;
    status: UserStatus;
};

interface SpeedBoardProps {
    roomId: string;
}

export default function SpeedBoard({ roomId }: SpeedBoardProps) {
    const [players, setPlayers] = useState<PlayerSpeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    // Track previous players to detect status changes
    const prevPlayersRef = useRef<PlayerSpeed[]>([]);
    const isFetchingRef = useRef(false);

    const fetchSpeeds = useCallback(async () => {
        // Prevent concurrent requests
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;

        try {
            const response = await fetch(`/api/room?id=${roomId}&action=getSpeeds`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-cache",
            });

            if (response.ok) {
                const data: PlayerSpeed[] = await response.json();

                // Only update state if data actually changed
                const hasChanged = JSON.stringify(data) !== JSON.stringify(prevPlayersRef.current);

                if (hasChanged) {
                    setPlayers(data);
                    prevPlayersRef.current = data;
                }

                setError(null);
                setIsLoading(false);
            } else {
                console.error("Failed to fetch speeds:", response.status);
                setError("Failed to load player speeds");
            }
        } catch (error) {
            console.error("Error fetching speeds:", error);
            setError("Connection error");
        } finally {
            isFetchingRef.current = false;
        }
    }, [roomId]);

    // Initial fetch
    useEffect(() => {
        fetchSpeeds();
    }, [fetchSpeeds]);

    // Poll every 3 seconds instead of 1 second (reduce API calls by 66%)
    useInterval(fetchSpeeds, 3000);

    // Filter and sort players
    const sortedPlayers = players
        .sort((a, b) => {
            // Active players first, then by WPM
            if (a.status === "ACTIVE" && b.status === "LEFT") return -1;
            if (a.status === "LEFT" && b.status === "ACTIVE") return 1;
            return b.wpm - a.wpm;
        });

    // Separate active and left players
    const activePlayers = sortedPlayers.filter(p => p.status === "ACTIVE");
    const leftPlayers = sortedPlayers.filter(p => p.status === "LEFT");

    return (
        <div
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                rounded-2xl shadow-lg p-6 mt-6 mx-auto w-[90vw] max-w-xs"
        >
            <h3 className="text-lg font-extrabold mb-4 text-green-400 flex items-center gap-2">
                <svg
                    className="w-7 h-7 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
                Live WPM
                {activePlayers.length > 0 && (
                    <span className="ml-auto text-xs font-normal text-gray-400">
                        {activePlayers.length} active
                    </span>
                )}
            </h3>

            {isLoading && players.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    <div className="animate-pulse">Loading...</div>
                </div>
            ) : error && players.length === 0 ? (
                <div className="py-8 text-center text-red-400">
                    {error}
                </div>
            ) : (
                <ul className="divide-y divide-gray-700">
                    {players.length === 0 ? (
                        <li className="py-4 text-center text-gray-500">No players yet</li>
                    ) : (
                        <>
                            {/* Active Players */}
                            {activePlayers.map((p, i) => {
                                const isCurrentUser = session?.user?.name === p.name;
                                const isTopPlayer = i === 0;

                                return (
                                    <li
                                        key={p.id || `${p.name}-${i}`}
                                        className={`flex items-center justify-between py-3 px-2 rounded-lg transition-all duration-200
                                            ${isTopPlayer ? "bg-gray-800 font-bold text-green-300 shadow-md scale-[1.02]" : ""}
                                            ${isCurrentUser && !isTopPlayer ? "bg-gray-800/50" : ""}
                                            hover:bg-gray-800`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {/* Status dot with pulse animation for active users */}
                                            <span
                                                className="relative flex h-2.5 w-2.5"
                                                title="Active"
                                            >
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                                            </span>

                                            {/* Top player crown */}
                                            {isTopPlayer && (
                                                <span
                                                    className="text-yellow-400 text-lg animate-pulse"
                                                    title="Top player"
                                                >
                                                    👑
                                                </span>
                                            )}

                                            <span className={`truncate max-w-[110px] ${isCurrentUser ? "text-green-300 font-semibold" : "text-gray-200"}`}>
                                                {isCurrentUser ? "You" : p.name}
                                            </span>
                                        </div>

                                        <span className="font-mono text-lg text-green-300">
                                            {p.wpm}{" "}
                                            <span className="text-xs text-green-500">
                                                WPM
                                            </span>
                                        </span>
                                    </li>
                                );
                            })}

                            {/* Left Players (if any) */}
                            {leftPlayers.length > 0 && (
                                <>
                                    {activePlayers.length > 0 && (
                                        <li className="py-2">
                                            <div className="text-xs text-gray-500 text-center">
                                                Left Room
                                            </div>
                                        </li>
                                    )}
                                    {leftPlayers.map((p, i) => {
                                        const isCurrentUser = session?.user?.name === p.name;

                                        return (
                                            <li
                                                key={p.id || `${p.name}-left-${i}`}
                                                className="flex items-center justify-between py-3 px-2 rounded-lg opacity-60 transition-opacity"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full bg-gray-600"
                                                        title="Left"
                                                    />

                                                    <span className="truncate max-w-[110px] text-gray-500 line-through">
                                                        {isCurrentUser ? "You" : p.name}
                                                    </span>

                                                    <span className="text-xs text-gray-600 ml-1">(left)</span>
                                                </div>

                                                <span className="font-mono text-lg text-gray-600">
                                                    {p.wpm}{" "}
                                                    <span className="text-xs text-gray-700">
                                                        WPM
                                                    </span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </>
                            )}
                        </>
                    )}
                </ul>
            )}
        </div>
    );
}