"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";
import { mediumText, customParagraphs, largeText, tenMinuteText, smallText } from "@/resources/text";
import { useRoomContext, Room } from "@/lib/context";
import TypingClock from "./test/TypingClock";
import { useSession } from "next-auth/react";

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
    const { data: session } = useSession();

    useEffect(() => {
        if (!id || !session?.user?.id) return;

        const markUserLeft = () => {
            const payload = JSON.stringify({
                action: "speed",
                roomId: id,
                userId: session.user.id,
                wpm: 0,
                correctword: 0,
                incorrectchar: [],
                status: "LEFT",
            });

            navigator.sendBeacon("/api/room", payload);
        };

        // Reload / close / back
        window.addEventListener("beforeunload", markUserLeft);

        // Tab switch / minimize
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                markUserLeft();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", markUserLeft);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [, session?.user?.id]);

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

    // Function to get appropriate text based on time limit
    const getTextByTimeLimit = (timeLimitSeconds: number, customText?: string): string => {
        // If custom text is provided, use it regardless of time limit
        if (customText && customText.trim()) {
            return customText;
        }

        switch (timeLimitSeconds) {
            case 60: // 1 minute
                return mediumText;
            case 180: // 3 minutes
                return largeText;
            case 300: // 5 minutes
                return tenMinuteText;
            case 600: // 10 minutes
                return customParagraphs.join(" ");
            default:
                // For any other time limit, determine based on duration
                if (timeLimitSeconds <= 60) {
                    return smallText;
                } else if (timeLimitSeconds <= 180) {
                    return mediumText;
                } else if (timeLimitSeconds <= 300) {
                    return largeText;
                } else {
                    return tenMinuteText;
                }
        }
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
                const roomTimeLimit = roomData.timeLimit || 60;
                setTimeLimit(roomTimeLimit); // Set time limit from room data
                
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

    // Get the appropriate text based on time limit and custom text
    const paragraphText = getTextByTimeLimit(timeLimit, state.room.customText);

    return (
        <div className="flex gap-2 md:flex-row flex-col mx-4 md:mx-10 my-10">
            <TypingInput
                paragraph={paragraphText}
                roomId={id as string}
                onTypingStatusChange={handleTypingStatusChange}
                overLimit={overLimit}
            />
            <div className="flex gap-1 flex-col items-center justify-center ">   
                <TypingClock
                    isTyping={isTyping}
                    onTimeUpdate={handleTimeUpdate}
                    roomId={id as string}
                    timeLimit={timeLimit}
                    onTimeUp={handleTimeUp}
                />
                <SpeedBoard roomId={id as string} />
            </div>
        </div>
    );
}