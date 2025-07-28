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
        <div className="bg-muted rounded-xl p-4 mt-4 w-full">
            <h3 className="text-lg font-semibold mb-2">Live WPM</h3>
            <ul className="grid grid-cols-2 gap-2">
                {players.map((p, i) => (
                    <li key={i} className="text-sm flex justify-between">
                        <span>{p.name}</span>
                        <span className="font-mono">{p.wpm} WPM</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}