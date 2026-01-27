"use client";

import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";
import { sendLeaveBeacon } from "@/lib/room/helpers";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function LeaveRoomButton({ id: roomId }: { id: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [leaving, setLeaving] = useState(false);

    // Prevent double-clicks and multiple submissions
    const isProcessingRef = useRef(false);

    const handleLeave = useCallback(async () => {
        // Guard against multiple clicks
        if (leaving || isProcessingRef.current) return;
        if (!session?.user?.id) {
            toast.error("Session expired. Please log in again.");
            return;
        }

        isProcessingRef.current = true;
        setLeaving(true);

        try {
            // ✅ Push buffered character performance
            await pushCharacterPerformance(roomId, session.user.id);

            // ✅ Update room status to FINISHED
            const requestBody = {
                action: 'start',
                id: roomId,
                status: 'FINISHED'
            };

            await fetch(`/api/room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            // ✅ Notify backend user left (beacon-safe)
            sendLeaveBeacon(roomId, session);

            // Small delay to allow beacon to flush
            await new Promise(resolve => setTimeout(resolve, 150));

            // Navigate to home
            router.push(`/room/${roomId}/result`);

        } catch (err) {
            console.error("Failed to leave room:", err);
            toast.error("Failed to leave room. Please try again.");

            // Reset state on error so user can retry
            setLeaving(false);
            isProcessingRef.current = false;
        }
    }, [leaving, roomId, session, router]);

    return (
        <button
            onClick={handleLeave}
            disabled={leaving || !session?.user?.id}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2
                text-white font-semibold hover:bg-red-700
                disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all duration-200 ease-in-out
                active:scale-95"
            aria-label="Leave typing room"
        >
            {leaving ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Leaving...
                </span>
            ) : (
                "Leave Room"
            )}
        </button>
    );
}