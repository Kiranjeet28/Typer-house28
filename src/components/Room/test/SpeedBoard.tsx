"use client";

import { useEffect, useState } from "react";

interface PlayerSpeed {
    id: string;
    name: string;
    wpm: number;
}

interface SpeedBoardProps {
    roomId: string;
}

export default function SpeedBoard({ roomId }: SpeedBoardProps) {
    const [players, setPlayers] = useState<PlayerSpeed[]>([]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/room/${roomId}/speed`);
                const data = await res.json();
                setPlayers(data.players);
            } catch (err) {
                console.error("Failed to fetch player speeds:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [roomId]);

    return (
        <div className="w-64 p-4 rounded-md border shadow-sm bg-muted">
            <h2 className="font-semibold mb-2">Live WPM</h2>
            <ul className="space-y-1">
                {players.map((p) => (
                    <li key={p.id} className="flex justify-between text-sm">
                        <span>{p.name}</span>
                        <span className="font-mono">{p.wpm}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
