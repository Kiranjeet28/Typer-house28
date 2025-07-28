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
        // Only update WPM if we have valid data
        if (!debouncedInput || !session?.user?.id || !startTime) return;
        
        const words = debouncedInput.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (words === 0) return; // Don't calculate WPM for empty input
        
        const timeInMinutes = (Date.now() - startTime) / 60000;
        if (timeInMinutes <= 0) return; // Prevent division by zero
        
        const speed = Math.round(words / timeInMinutes);
        
        // Only update if WPM is reasonable (0-200 range)
        if (speed >= 0 && speed <= 200) {
            setWpm(speed);
            
            // Send WPM update to server
            fetch(`/api/room`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": session.user.id,
                },
                body: JSON.stringify({ 
                    action: "speed", 
                    roomId: roomId, 
                    wpm: speed 
                }),
            }).catch(error => {
                console.error("Failed to update WPM:", error);
            });
        }
    }, [debouncedInput, session?.user?.id, roomId, startTime]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!startTime) {
            setStartTime(Date.now());
        }
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
            <div className="text-sm text-muted-foreground">
                Current WPM: {wpm}
            </div>
        </div>
    );
}