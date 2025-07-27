"use client";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSession } from "next-auth/react";

export default function TypingInput({ roomId, paragraph }: { roomId: string, paragraph: string }) {
    const [input, setInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const debouncedInput = useDebounce(input, 1000);
    const { data: session } = useSession();

    useEffect(() => {
        if (!debouncedInput || !session?.user?.id) return;
        const words = debouncedInput.trim().split(/\s+/).length;
        const time = (Date.now() - (startTime ?? Date.now())) / 60000;
        const speed = Math.round(words / time);

        setWpm(speed);
        fetch(`/api/room/${roomId}/speed`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": session.user.id,
            },
            body: JSON.stringify({ wpm: speed }),
        });
    }, [debouncedInput, session?.user?.id, roomId, startTime]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!startTime) setStartTime(Date.now());
        setInput(e.target.value);
    };

    const getColorizedParagraph = () => {
        return paragraph.split("").map((char, idx) => {
            let color = "";
            if (idx < input.length) {
                color = input[idx] === char ? "text-green-500" : "text-red-500";
            }
            return (
                <span key={idx} className={color}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border rounded-md leading-7 bg-background">
                {getColorizedParagraph()}
            </div>
            <textarea
                value={input}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="Start typing..."
                rows={5}
            />
        </div>
    );
}
