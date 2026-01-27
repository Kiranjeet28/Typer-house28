"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";
import { useRoomContext, Room } from "@/lib/context";
import TypingClock from "./test/TypingClock";
import { useSession } from "next-auth/react";
import { getTextByTimeLimit, sendLeaveBeacon } from "@/lib/room/helpers";
import { LeaveRoomButton } from "./test/LeaveButton";
import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";
import { toast } from "sonner";

export default function TypingTestPage() {
    const { id: rawId } = useParams();
    const roomId = Array.isArray(rawId) ? rawId[0] : rawId;

    const router = useRouter();
    const { state, dispatch } = useRoomContext();
    const { data: session } = useSession();

    const [timeLimit, setTimeLimit] = useState(60);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [overLimit, setOverLimit] = useState(false);

    // Refs to prevent redundant operations
    const hasRedirectedRef = useRef(false);
    const isFetchingRef = useRef(false);

    /* ----------------------------------
       Typing / Clock Callbacks
    ---------------------------------- */

    const handleTypingStatusChange = useCallback((typing: boolean) => {
        setIsTyping(typing);
    }, []);

    const handleTimeUp = useCallback(async () => {
        if (hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;

        if (roomId && session?.user?.id) {
            await pushCharacterPerformance(roomId, session.user.id);
        }

        setOverLimit(true);
        router.push(`/room/${roomId}/result`);
    }, [roomId, session?.user?.id, router]);

    /* ----------------------------------
       Fetch Room (Only Once)
    ---------------------------------- */

    useEffect(() => {
        if (!roomId || isFetchingRef.current) return;

        isFetchingRef.current = true;

        const fetchRoomData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(`/api/room?action=get&id=${roomId}`);
                if (!res.ok) throw new Error("Room not found");

                const roomData: Room = await res.json();
                dispatch({ type: "SET_ROOM", payload: roomData });
                setTimeLimit(roomData.timeLimit || 60);

                if (
                    roomData.status === "FINISHED" ||
                    roomData.status === "EXPIRED"
                ) {
                    if (!hasRedirectedRef.current) {
                        hasRedirectedRef.current = true;
                        toast.info("The test has already ended. Redirecting to results.");
                        router.push(`/room/${roomId}/result`);
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load room");
            } finally {
                setIsLoading(false);
                isFetchingRef.current = false;
            }
        };

        fetchRoomData();
    }, [roomId]); // Only depends on roomId

    /* ----------------------------------
       Poll Room Status (Optimized - 10s interval)
    ---------------------------------- */

    useEffect(() => {
        if (!roomId || !state.room || isLoading || hasRedirectedRef.current) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/room?action=get&id=${roomId}`, {
                    // Add cache control to prevent unnecessary requests
                    cache: "no-cache",
                });
                if (!res.ok) return;

                const roomData: Room = await res.json();

                // Only update if status actually changed
                if (roomData.status !== state.room?.status) {
                    dispatch({ type: "SET_ROOM", payload: roomData });

                    if (
                        (roomData.status === "FINISHED" ||
                            roomData.status === "EXPIRED") &&
                        !hasRedirectedRef.current
                    ) {
                        hasRedirectedRef.current = true;
                        router.push(`/room/${roomId}/result`);
                    }
                }
            } catch (e) {
                console.error("Room status check failed", e);
            }
        }, 10000); // Increased from 5s to 10s to reduce API calls

        return () => clearInterval(interval);
    }, [roomId, state.room?.status, isLoading]); // Optimized dependencies

    /* ----------------------------------
       Cleanup
    ---------------------------------- */

    useEffect(() => {
        return () => {
            dispatch({ type: "CLEAR_ROOM" });
        };
    }, []); // Remove dispatch from dependencies

    /* ----------------------------------
       Render States
    ---------------------------------- */

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2">
                    <div className="animate-pulse text-green-500 text-xl">Loading room...</div>
                    <div className="text-gray-500 text-sm">Please wait</div>
                </div>
            </div>
        );
    }

    if (error || !state.room) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-4">
                    <p className="text-red-500 text-lg">{error ?? "Room not available"}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (
        state.room.status === "FINISHED" ||
        state.room.status === "EXPIRED"
    ) {
        if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push(`/room/${roomId}/result`);
        }
        return null;
    }

    const paragraphText = getTextByTimeLimit(
        timeLimit,
        state.room.customText
    );

    /* ----------------------------------
       Main UI
    ---------------------------------- */

    return (
        <div className="flex gap-2 md:flex-row flex-col mx-4 md:mx-10 my-10">
            <TypingInput
                paragraph={paragraphText}
                roomId={roomId as string}
                onTypingStatusChange={handleTypingStatusChange}
                overLimit={overLimit}
            />

            <div className="flex gap-2 flex-col items-center">
                {roomId && <LeaveRoomButton id={roomId} />}
                <TypingClock
                    isTyping={isTyping}
                    roomId={roomId as string}
                    timeLimit={timeLimit}
                    onTimeUp={handleTimeUp}
                />
                <SpeedBoard roomId={roomId as string} />
            </div>
        </div>
    );
}