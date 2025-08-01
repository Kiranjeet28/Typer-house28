// src/components/Room/test/SpeedBoard.tsx
"use client";
import { useEffect, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import { useSession } from "next-auth/react";

type PlayerSpeed = {
    name: string;
    wpm: number;
};

interface SpeedBoardProps {
    roomId: string;
}

export default function SpeedBoard({ roomId }: SpeedBoardProps) {
    const [players, setPlayers] = useState<PlayerSpeed[]>([]);
    const { data: session } = useSession();

    const fetchSpeeds = async () => {
        try {
            const response = await fetch(`/api/room?id=${roomId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (response.ok) {
                const data: PlayerSpeed[] = await response.json();
                setPlayers(data);
            } else {
                console.error("Failed to fetch speeds:", response.status);
            }
        } catch (error) {
            console.error("Error fetching speeds:", error);
        }
    };

    // Fetch speeds immediately on mount
    useEffect(() => {
        fetchSpeeds();
    }, [roomId]);

    // Use interval to fetch speeds every second
    useInterval(() => {
        fetchSpeeds();
    }, 1000);

    return (
        <div
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 mt-6 mx-auto
            w-[90vw] max-w-xs
            "
        >
            <h3 className="text-lg font-extrabold mb-4 text-green-400 flex items-center gap-2">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h-1v-4h-1m-4 4h-1v-4h-1m8 4h-1v-4h-1" />
                </svg>
                Live WPM
            </h3>
            <ul className="divide-y divide-gray-700">
                {players.length === 0 ? (
                    <li className="py-4 text-center text-gray-500">No players yet</li>
                ) : (
                    players
                        .sort((a, b) => b.wpm - a.wpm)
                        .map((p, i) => {
                            const isCurrentUser = session?.user?.name === p.name;
                            return (
                                <li
                                    key={i}
                                    className={`flex items-center justify-between py-3 px-2 rounded-lg transition ${
                                        i === 0
                                            ? "bg-gray-800 font-bold text-green-300 shadow"
                                            : "hover:bg-gray-800"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {i === 0 && (
                                            <span className="text-yellow-400 text-lg" title="Top player">★</span>
                                        )}
                                        <span className="truncate max-w-[120px] text-gray-200">
                                            {isCurrentUser ? "you" : p.name}
                                        </span>
                                    </div>
                                    <span className="font-mono text-lg text-green-300">
                                        {p.wpm} <span className="text-xs text-green-500">WPM</span>
                                    </span>
                                </li>
                            );
                        })
                )}
            </ul>
        </div>
    );
}