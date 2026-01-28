"use client";
import TypingTestPage from '@/components/Room/Test'
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react'

function page() {
    const { id: rawId } = useParams();
    const roomId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { data: session } = useSession();

    // ✅ Track if we've already called the API (prevents duplicate calls)
    const hasCalledRef = useRef(false);

    useEffect(() => {
        if (!roomId || !session?.user?.id) return;

        const userId = session.user.id as string;

        const requestBody = { action: 'start', id: roomId, status: 'FINISHED' };

        // ✅ Handle page unload (tab close, browser close, refresh)
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Prevent duplicate calls
            if (hasCalledRef.current) return;
            hasCalledRef.current = true;

            // Use sendBeacon for guaranteed delivery even as page closes
            const data = new Blob([JSON.stringify(requestBody)], {
                type: 'application/json'
            });

            // sendBeacon is synchronous and works even when page is closing
            navigator.sendBeacon('/api/room', data);
        };

        // ✅ Register the event listener
        window.addEventListener('beforeunload', handleBeforeUnload);

        // ✅ Cleanup
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [roomId, session?.user?.id]);

    return (
        <TypingTestPage />
    )
}

export default page