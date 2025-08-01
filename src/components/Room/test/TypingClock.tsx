"use client";
import { useEffect, useState, useRef } from "react";

interface TypingClockProps {
    isTyping: boolean;
    onTimeUpdate?: (seconds: number) => void;
    roomId: string;
    timeLimit?: number; // Time limit in seconds (default: 60 seconds)
    onTimeUp?: () => void; // Callback when time is up
}

export default function TypingClock({ 
    isTyping, 
    onTimeUpdate, 
    roomId, 
    timeLimit = 60,
    onTimeUp 
}: TypingClockProps) {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(true); // Start immediately
    const [gameFinished, setGameFinished] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // API call to finish the game
    const finishGame = async () => {
        if (gameFinished) return; // Prevent multiple calls
        
        try {
            setGameFinished(true);
            console.log('Time is up, finishing game...');
            
            const requestBody = { 
                action: 'start', 
                id: roomId, 
                status: 'FINISHED' 
            };
            
            const res = await fetch(`/api/room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || `HTTP error! status: ${res.status}`);
            }
            
            console.log('Game finished successfully');
            onTimeUp?.(); // Call the callback if provided
            
        } catch (err: any) {
            console.error('Failed to finish game:', err);
            setGameFinished(false); // Reset on error to allow retry
        }
    };

    // Start timer immediately when component mounts
    useEffect(() => {
        if (!gameFinished && !startTimeRef.current) {
            setIsActive(true);
            startTimeRef.current = Date.now();
            console.log('Timer started automatically on component mount');
        }
    }, []); // Empty dependency array means this runs once on mount

    // Main timer effect - starts immediately, no dependency on isTyping
    useEffect(() => {
        if (isActive && !gameFinished && startTimeRef.current) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTimeRef.current!) / 1000);
                
                if (elapsed >= timeLimit) {
                    // Time is up
                    setElapsedTime(timeLimit);
                    setIsActive(false);
                    onTimeUpdate?.(timeLimit);
                    finishGame();
                } else {
                    setElapsedTime(elapsed);
                    onTimeUpdate?.(elapsed);
                }
            }, 100); // Update every 100ms for smooth display
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, timeLimit, onTimeUpdate, gameFinished]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate remaining time
    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    const isTimeRunningOut = remainingTime <= 10 && remainingTime > 0;
    const isTimeUp = remainingTime === 0;

    return (
        <div className="bg-[#10151a] p-6 rounded-xl shadow-lg border border-green-900/40 w-full max-w-sm">
            <div className="flex items-center justify-center gap-3">
                <div className="relative">
                    <svg 
                        className={`w-8 h-8 transition-colors ${
                            isTimeUp ? 'text-red-500' : 
                            isTimeRunningOut ? 'text-yellow-500 animate-pulse' : 
                            'text-green-500'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth={2} 
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="10" className="opacity-30"/>
                        <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {isActive && !isTimeUp && (
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping ${
                            isTimeRunningOut ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                    )}
                </div>
                <div className="text-center">
                    <div className={`text-sm font-semibold mb-1 ${
                        isTimeUp ? 'text-red-400' : 
                        isTimeRunningOut ? 'text-yellow-400' : 
                        'text-green-400'
                    }`}>
                        {isTimeUp ? 'TIME UP!' : 'TIME LEFT'}
                    </div>
                    <div className={`font-mono text-3xl font-bold drop-shadow-glow ${
                        isTimeUp ? 'text-red-500' : 
                        isTimeRunningOut ? 'text-yellow-500' : 
                        'text-green-500'
                    }`}>
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