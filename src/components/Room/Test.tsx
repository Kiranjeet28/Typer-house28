"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TypingInput from "./test/TypingInput";
import SpeedBoard from "./test/SpeedBoard";
import {smallText} from "@/resources/text";

export default function TypingTestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [text, setText] = useState<string>(smallText);
    const [duration, setDuration] = useState<number>(60); // You can set this from room settings
    const [wpm, setWpm] = useState(0);

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


    return (
        <div className="flex gap-2 md:flex-row flex-col mx-4 md:mx-10 my-10 ">
                <TypingInput
                    paragraph={text}
                    roomId={id as string}
                />
            <SpeedBoard roomId={id as string} />
        </div>
    );
}
