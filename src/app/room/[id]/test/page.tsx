"use client";
import TypingTestPage from '@/components/Room/Test'
import { sendLeaveBeacon } from '@/lib/room/helpers';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

function page() {
   const { id: rawId } = useParams();
  const roomId = Array.isArray(rawId) ? rawId[0] : rawId;
     const { data: session } = useSession();
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
  return (
      <TypingTestPage/>
  )
}

export default page