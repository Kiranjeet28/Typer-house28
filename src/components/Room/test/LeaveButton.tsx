"use client";

import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";
import { sendLeaveBeacon } from "@/lib/room/helpers";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LeaveRoomButton({ id: roomId }: { id: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [leaving, setLeaving] = useState(false);

    const handleLeave = async () => {
        if (leaving) return;
        if (!session?.user?.id) return;

        setLeaving(true);

        try {
            // ✅ push buffered character performance ONCE
            await pushCharacterPerformance(roomId, session.user.id);
        } catch (err) {
            console.error("Failed to push character performance", err);
        }

        // ✅ notify backend user left (beacon-safe)
        sendLeaveBeacon(roomId, session);

        // small delay to allow beacon to flush
        setTimeout(() => {
            router.push("/"); // or /lobby
        }, 100);
    };

    return (
        <button
            onClick={handleLeave}
            disabled={leaving}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2
        text-white font-semibold hover:bg-red-700
        disabled:opacity-50 transition"
        >
            {leaving ? "Leaving..." : "Leave Room"}
        </button>
    );
}
