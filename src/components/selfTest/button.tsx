"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SelfTestButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const key = "typerhouse.selfTestCounter";
            const next = Number(localStorage.getItem(key) || "0") + 1;
            localStorage.setItem(key, String(next));

            const name = `Self Test #${next}`;

            const createBody = {
                action: "create",
                name,
                description: "The self testing of the user",
                maxPlayers: 1,
                isPrivate: true,
                textLength: "MEDIUM",
                timeLimit: 60,
                customText: "",
            };

            const res = await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createBody),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to create room");

            const roomId = data.roomId || data.data?.id || data.id;
            if (!roomId) throw new Error("Room ID missing in response");

            // Start the game immediately for single-player self test
            const startRes = await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "start", id: roomId, status: "IN_GAME" }),
            });

            const startData = await startRes.json();
            if (!startRes.ok) throw new Error(startData?.error || "Failed to start room");

            router.push("/room/" + roomId+"/test");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleClick} disabled={loading} className="min-w-[160px]">
            {loading ? "Starting..." : "Start Self Test"}
        </Button>
    );
}

