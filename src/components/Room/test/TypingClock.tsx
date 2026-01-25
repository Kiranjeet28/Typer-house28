"use client";

import { hasCharacterData } from "@/lib/store/characterStore";
import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

interface TypingClockProps {
    isTyping: boolean;
    onTimeUpdate?: (seconds: number) => void;
    roomId: string;
    timeLimit?: number;
    onTimeUp?: () => void;
}

export default function TypingClock({
    isTyping,
    onTimeUpdate,
    roomId,
    timeLimit = 60,
    onTimeUp,
}: TypingClockProps) {
    const { data: session } = useSession();

    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [gameFinished, setGameFinished] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    /* ----------------------------------
       FINISH GAME (SINGLE FLUSH)
    ---------------------------------- */

    const finishGame = async () => {
        if (gameFinished || !session?.user?.id) return;

        setGameFinished(true);

        if (hasCharacterData()) {
            await pushCharacterPerformance(roomId, session.user.id);
        }

        await fetch(`/api/room`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "start",
                id: roomId,
                status: "FINISHED",
            }),
        });

        onTimeUp?.();
    };


    /* ----------------------------------
       START TIMER ON MOUNT
    ---------------------------------- */
    useEffect(() => {
        if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
            setIsActive(true);
        }
    }, []);

    /* ----------------------------------
       MAIN TIMER LOOP
    ---------------------------------- */
    useEffect(() => {
        if (!isActive || gameFinished || !startTimeRef.current) return;

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor(
                (now - startTimeRef.current!) / 1000
            );

            if (elapsed >= timeLimit) {
                setElapsedTime(timeLimit);
                onTimeUpdate?.(timeLimit);
                setIsActive(false);
                finishGame();
            } else {
                setElapsedTime(elapsed);
                onTimeUpdate?.(elapsed);
            }
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, timeLimit, gameFinished]);

    /* ----------------------------------
       CLEANUP
    ---------------------------------- */
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    /* ----------------------------------
       UI HELPERS
    ---------------------------------- */
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    const isTimeRunningOut = remainingTime <= 10 && remainingTime > 0;
    const isTimeUp = remainingTime === 0;

    /* ----------------------------------
       UI
    ---------------------------------- */
    return (
        <div className="bg-[#10151a] p-6 rounded-xl shadow-lg border border-green-900/40 w-full max-w-sm">
            <div className="flex items-center justify-center gap-3">
                <div className="relative">
                    <svg
                        className={`w-8 h-8 transition-colors ${isTimeUp
                                ? "text-red-500"
                                : isTimeRunningOut
                                    ? "text-yellow-500 animate-pulse"
                                    : "text-green-500"
                            }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="10" className="opacity-30" />
                        <polyline
                            points="12,6 12,12 16,14"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <div className="text-center">
                    <div
                        className={`text-sm font-semibold mb-1 ${isTimeUp
                                ? "text-red-400"
                                : isTimeRunningOut
                                    ? "text-yellow-400"
                                    : "text-green-400"
                            }`}
                    >
                        {isTimeUp ? "TIME UP!" : "TIME LEFT"}
                    </div>

                    <div
                        className={`font-mono text-3xl font-bold ${isTimeUp
                                ? "text-red-500"
                                : isTimeRunningOut
                                    ? "text-yellow-500"
                                    : "text-green-500"
                            }`}
                    >
                        {formatTime(remainingTime)}
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                        Elapsed: {formatTime(elapsedTime)}
                    </div>
                </div>
            </div>
        </div>
    );
}
