"use client";
import TypingTestPage from '@/components/Room/Test'
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react'
import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";

function page() {
    const { id: rawId } = useParams();
    const roomId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { data: session } = useSession();

    useEffect(() => {
        if (!roomId || !session?.user?.id) return;

        const userId = session.user.id as string;

        const handleUnload = (e: BeforeUnloadEvent) => {
            // Use sendBeacon for guaranteed delivery
            const data = JSON.stringify({
                roomId,
                userId,
                timestamp: Date.now()
            });

            // sendBeacon is synchronous and guaranteed to send even as page closes
            const beaconUrl = `/api/character-performance`;
            navigator.sendBeacon(beaconUrl, data);

            // Also try pushCharacterPerformance as backup
            void pushCharacterPerformance(roomId, userId);
        };

        const handleVisibilityChange = () => {
            // When page becomes hidden (tab switch, minimize, etc.)
            if (document.hidden) {
                void pushCharacterPerformance(roomId, userId);
            }
        };

        const handlePageHide = () => {
            // Fires when navigating away, closing tab, etc.
            const data = JSON.stringify({
                roomId,
                userId,
                timestamp: Date.now()
            });
            navigator.sendBeacon(`/api/character-performance`, data);
        };

        // Multiple event listeners for comprehensive coverage
        window.addEventListener("beforeunload", handleUnload);
        window.addEventListener("pagehide", handlePageHide);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            // Cleanup on unmount (route change within app)
            void pushCharacterPerformance(roomId, userId);

            window.removeEventListener("beforeunload", handleUnload);
            window.removeEventListener("pagehide", handlePageHide);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [roomId, session]);

    return (
        <TypingTestPage />
    )
}

export default page