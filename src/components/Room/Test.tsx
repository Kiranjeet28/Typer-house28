"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";
import {
    mediumText,
    customParagraphs,
    largeText,
    tenMinuteText,
    smallText,
} from "@/resources/text";
import { useRoomContext, Room } from "@/lib/context";
import TypingClock from "./test/TypingClock";
import { useSession } from "next-auth/react";
import { getTextByTimeLimit, sendLeaveBeacon } from "@/lib/room/helpers";
import { LeaveRoomButton } from "./test/LeaveButton";

export default function TypingTestPage() {
    const { id: rawId } = useParams();
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const router = useRouter();
    const { state, dispatch } = useRoomContext();
    const { data: session } = useSession();

    const [timeLimit, setTimeLimit] = useState(60);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [overLimit, setOverLimit] = useState(false);

    /* ----------------------------------
       Leave / Tab Close Handling
    ---------------------------------- */
    useEffect(() => {
        if (!id || !session?.user?.id) return;

        const handleUnload = () => {
            sendLeaveBeacon(id, session);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                sendLeaveBeacon(id, session);
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [id, session]);

    /* ----------------------------------
       Typing / Clock Callbacks
    ---------------------------------- */

    const handleTypingStatusChange = (typing: boolean) => {
        setIsTyping(typing);
    };

    const handleTimeUp = () => {
        setOverLimit(true);
        router.push(`/room/${id}/result`);
    };

    /* ----------------------------------
       Fetch Room
    ---------------------------------- */

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

                const res = await fetch(`/api/room?action=get&id=${id}`);
                if (!res.ok) throw new Error("Room not found");

                const roomData: Room = await res.json();
                dispatch({ type: "SET_ROOM", payload: roomData });
                setTimeLimit(roomData.timeLimit || 60);

                if (roomData.status === "FINISHED" || roomData.status === "EXPIRED") {
                    router.push(`/room/${id}/result`);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load room");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [id, dispatch, router]);

    /* ----------------------------------
       Poll Room Status
    ---------------------------------- */

    useEffect(() => {
        if (!id || !state.room || isLoading) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/room?action=get&id=${id}`);
                if (!res.ok) return;

                const roomData: Room = await res.json();
                if (roomData.status !== state.room?.status) {
                    dispatch({ type: "SET_ROOM", payload: roomData });
                    if (
                        roomData.status === "FINISHED" ||
                        roomData.status === "EXPIRED"
                    ) {
                        router.push(`/room/${id}/result`);
                    }
                }
            } catch (e) {
                console.error("Room status check failed", e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [id, state.room, isLoading, dispatch, router]);

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
        router.push(`/room/${id}/result`);
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
                roomId={id as string}
                onTypingStatusChange={handleTypingStatusChange}
                overLimit={overLimit}
            />

            <div className="flex gap-2 flex-col items-center">
                {id && <LeaveRoomButton id={id} />}
                <TypingClock
                    isTyping={isTyping}
                    roomId={id as string}
                    timeLimit={timeLimit}
                    onTimeUp={handleTimeUp}
                />
                <SpeedBoard roomId={id as string} />
            </div>
        </div>
    );
}
