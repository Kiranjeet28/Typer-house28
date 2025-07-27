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

    useInterval(() => {
        fetch(`/api/room`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: 'speed',
                roomId: roomId,
            }),
        })
            .then(res => res.json())
            .then((data: PlayerSpeed[]) => setPlayers(data));
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
