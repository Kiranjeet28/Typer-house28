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

        const handleUnload = () => {
            // beforeunload won't wait for async work, so fire-and-forget
            void pushCharacterPerformance(roomId, userId);
        };
        const requestBody = { action: 'start', id: roomId, status: 'FINISHED' };

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
    return (
        <TypingTestPage />
    )
}

export default page