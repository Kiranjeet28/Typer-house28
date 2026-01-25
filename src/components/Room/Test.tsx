"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";
import { useRoomContext, Room } from "@/lib/context";
import TypingClock from "./test/TypingClock";
import { useSession } from "next-auth/react";
import { getTextByTimeLimit, sendLeaveBeacon } from "@/lib/room/helpers";
import { LeaveRoomButton } from "./test/LeaveButton";
import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";

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

    /* ----------------------------------
       TAB CLOSE / RELOAD (sendBeacon)
    ---------------------------------- */
    useEffect(() => {
        if (!roomId || !session?.user?.id) return;

        const handleUnload = () => {
            // push character performance safely
            navigator.sendBeacon(
                "/api/room",
                JSON.stringify({
                    action: "charPerformance",
                    roomId,
                    userId: session.user.id,
                })
            );

            sendLeaveBeacon(roomId, session);
        };
        const requestBody = { action: 'start', id: roomId, status: 'FINISHED' };
        console.log('Start game request body:', requestBody);

        const sendStart = async () => {
            try {
                await fetch(`/api/room`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });
            } catch (e) {
                console.error('Failed to send start request', e);
            }
        };
        // sendStart();

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [roomId, session]);

    /* ----------------------------------
       Typing / Clock Callbacks
    ---------------------------------- */

    const handleTypingStatusChange = (typing: boolean) => {
        setIsTyping(typing);
    };

    const handleTimeUp = async () => {
        if (roomId && session?.user?.id) {
            await pushCharacterPerformance(roomId, session.user.id);
        }

        setOverLimit(true);
        router.push(`/room/${roomId}/result`);
    };

    /* ----------------------------------
       Fetch Room
    ---------------------------------- */

    useEffect(() => {
        if (!roomId) {
            setError("Room ID is missing");
            setIsLoading(false);
            return;
        }

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
                    router.push(`/room/${roomId}/result`);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load room");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId, dispatch, router]);

    /* ----------------------------------
       Poll Room Status
    ---------------------------------- */

    useEffect(() => {
        if (!roomId || !state.room || isLoading) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/room?action=get&id=${roomId}`);
                if (!res.ok) return;

                const roomData: Room = await res.json();
                if (roomData.status !== state.room?.status) {
                    dispatch({ type: "SET_ROOM", payload: roomData });

                    if (
                        roomData.status === "FINISHED" ||
                        roomData.status === "EXPIRED"
                    ) {
                        router.push(`/room/${roomId}/result`);
                    }
                }
            } catch (e) {
                console.error("Room status check failed", e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [roomId, state.room, isLoading, dispatch, router]);

    /* ----------------------------------
       Cleanup
    ---------------------------------- */

    useEffect(() => {
        return () => {
            dispatch({ type: "CLEAR_ROOM" });
        };
    }, [dispatch]);

    /* ----------------------------------
       Render States
    ---------------------------------- */

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-gray-600">Loading room...</p>
            </div>
        );
    }

    if (error || !state.room) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-red-500">{error ?? "Room not available"}</p>
            </div>
        );
    }

    if (
        state.room.status === "FINISHED" ||
        state.room.status === "EXPIRED"
    ) {
        router.push(`/room/${roomId}/result`);
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
