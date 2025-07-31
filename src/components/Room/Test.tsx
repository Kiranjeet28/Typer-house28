"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";
import { smallText } from "@/resources/text";
import { useRoomContext, Room } from "@/lib/context";
import TypingClock from "./test/TypingClock";

export default function TypingTestPage() {
    const { id } = useParams();
    const { state, dispatch } = useRoomContext();
    const router = useRouter();
    const [timeLimit, setTimeLimit] = useState(60); // Default time limit
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [overLimit, setOverLimit] = useState(false);
    const handleTypingStatusChange = (typing: boolean) => {
        setIsTyping(typing);
    };

    const handleTimeUpdate = (seconds: number) => {
        setCurrentTime(seconds);
    };

    const handleTimeUp = () => {
        setOverLimit(true);
        router.push(`/room/${id}/result`);
    };

    useEffect(() => {
        if (!id) {
            setError("Room ID is missing");
            setIsLoading(false);
            return;
        }

        const fetchRoomData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Try GET request first (cleaner URL)
                const response = await fetch(`/api/room?action=get&id=${id}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch room data: ${response.status}`);
                }

                const roomData: Room = await response.json();
                setTimeLimit(roomData.timeLimit || 60); // Default to 60 seconds if not set
                if (!roomData) {
                    throw new Error("Room not found");
                }

                // Check room status and redirect if needed
                if (roomData.status === 'FINISHED' || roomData.status === 'EXPIRED') {
                    console.log(`Room status is ${roomData.status}, redirecting to results`);
                    router.push(`/room/${id}/result`);
                    return;
                }

                // Set room data in context
                dispatch({ type: 'SET_ROOM', payload: roomData });
                
            } catch (fetchError) {
                console.error("Error fetching room data:", fetchError);
                setError(fetchError instanceof Error ? fetchError.message : "Failed to load room data");
                
                // If room not found, redirect to home or show error
                if (fetchError instanceof Error && fetchError.message.includes("not found")) {
                    router.push("/");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [id, dispatch, router]);

    // Periodic status check while game is active
    useEffect(() => {
        if (!id || !state.room || isLoading) return;

        const checkRoomStatus = async () => {
            try {
                const response = await fetch(`/api/room?action=get&id=${id}`);
                if (response.ok) {
                    const roomData: Room = await response.json();
                    if (roomData && roomData.status !== state.room?.status) {
                        dispatch({ type: 'SET_ROOM', payload: roomData });
                        
                        // If room status changed to FINISHED or EXPIRED, redirect
                        if (roomData.status === 'FINISHED' || roomData.status === 'EXPIRED') {
                            router.push(`/room/${id}/result`);
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking room status:", error);
            }
        };

        // Check room status every 5 seconds
        const statusInterval = setInterval(checkRoomStatus, 5000);

        return () => {
            clearInterval(statusInterval);
        };
    }, [id, state.room, dispatch, isLoading, router]);

    // Cleanup context on unmount
    useEffect(() => {
        return () => {
            dispatch({ type: 'CLEAR_ROOM' });
        };
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading room data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Room</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (!state.room) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-gray-600">Room data not available</p>
                </div>
            </div>
        );
    }

    // Check if room status has changed to FINISHED or EXPIRED
    if (state.room.status === 'FINISHED' || state.room.status === 'EXPIRED') {
        router.push(`/room/${id}/result`);
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Game completed. Redirecting to results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-2 md:flex-row flex-col mx-4 md:mx-10 my-10">
          
            <TypingInput
                paragraph={state.room.customText || smallText}
                roomId={id as string}
                onTypingStatusChange={handleTypingStatusChange} // Make sure to pass this prop
                overLimit={overLimit}
            />
            <div className="flex gap-1  flex-col items-center justify-center w-full">   
                 <TypingClock
                isTyping={isTyping}
                onTimeUpdate={handleTimeUpdate}
                roomId={id as string}
                timeLimit={timeLimit} // 60 seconds time limit
                onTimeUp={handleTimeUp}
            />
            <SpeedBoard roomId={id as string} />
            </div>
        </div>
    );
}