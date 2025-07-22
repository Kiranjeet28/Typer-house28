"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";


const fetchText = async (length: number) => {
    const res = await fetch(`/api/typing-text?length=${length}`);
    if (!res.ok) throw new Error("Failed to fetch text");
    const data = await res.json();
    return data.text as string;
};

export default function TypingTestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState<number>(60); // You can set this from room settings
    const [wpm, setWpm] = useState(0);

    // Fetch sample paragraph
    useEffect(() => {
        fetchText(duration * 5)
            .then(setText)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [duration]);

    // Redirect to result page after timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(`/room/${id}/result`);
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [duration, id, router]);

    // Callback when test is complete (optional enhancement)
    const handleComplete = () => {
        router.push(`/room/${id}/result`);
    };

    if (loading) return <p className="text-center mt-10">Loading text...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-10">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-xl">
                            Typing Test - Room ID: {id}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TypingInput
                            sampleText={text}
                            timeLimit={duration}
                            onComplete={handleComplete}
                            onProgress={(speed: number) => setWpm(speed)}
                        />
                    </CardContent>
                </Card>
            </div>
            <SpeedBoard roomId={id as string} />
        </div>
    );
}
