import { sendLeaveBeacon } from "@/lib/room/helpers";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function LeaveRoomButton({id}: {id: string}) {
    const router = useRouter();
    const [leaving, setLeaving] = useState(false);
  const { data: session } = useSession();
    const handleLeave = () => {
        if (leaving) return;

        setLeaving(true);
        sendLeaveBeacon(id, session);

        // Small delay ensures beacon flushes
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
