"use client";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSession } from "next-auth/react";
import clsx from "clsx";

export default function TypingInput({ roomId, paragraph }: { roomId: string, paragraph: string }) {
    const [input, setInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const debouncedInput = useDebounce(input, 1000);
    const { data: session } = useSession();

    // Count correctly typed words - more flexible approach
    const getCorrectWordsCount = (typedText: string, originalText: string) => {
        if (!typedText.trim()) return 0;
        const normalizedOriginal = originalText.trim().replace(/\s+/g, ' ');
        const normalizedTyped = typedText.trim().replace(/\s+/g, ' ');
        const typedWords = normalizedTyped.split(' ');
        const originalWords = normalizedOriginal.split(' ');
        let correctWords = 0;
        for (let i = 0; i < Math.min(typedWords.length, originalWords.length); i++) {
            if (typedWords[i] === originalWords[i]) {
                correctWords++;
            } else {
                break;
            }
        }
        return correctWords;
    };

    useEffect(() => {
        if (!debouncedInput || !session?.user?.id || !startTime) return;
        const normalizedParagraph = paragraph.trim().replace(/\s+/g, ' ');
        const correctWords = getCorrectWordsCount(debouncedInput, normalizedParagraph);
        if (correctWords === 0) return;
        const timeInMinutes = (Date.now() - startTime) / 60000;
        if (timeInMinutes <= 0) return;
        const speed = Math.round(correctWords / timeInMinutes);
        if (speed >= 0 && speed <= 200) {
            setWpm(speed);
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
    }, [debouncedInput, session?.user?.id, roomId, startTime, paragraph]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!startTime) {
            setStartTime(Date.now());
        }
        setInput(e.target.value);
    };

    const getColorizedParagraph = () => {
        const normalizedParagraph = paragraph.trim().replace(/\s+/g, ' ');
        return normalizedParagraph.split("").map((char, idx) => {
            let colorClass = "text-gray-500";
            let bgClass = "";
            if (idx < input.length) {
                if (input[idx] === char) {
                    colorClass = "text-green-400 font-bold drop-shadow-glow";
                    bgClass = "bg-green-900/30 rounded";
                } else {
                    colorClass = "text-red-400 font-semibold";
                    bgClass = "bg-red-900/30 rounded";
                }
            } else if (idx === input.length) {
                colorClass = "text-green-300 font-bold animate-pulse";
                bgClass = "bg-green-800/60 rounded";
            }
            return (
                <span
                    key={idx}
                    className={clsx(
                        "transition-colors duration-150 px-0.5",
                        colorClass,
                        bgClass
                    )}
                >
                    {char}
                </span>
            );
        });
    };

    const normalizedParagraph = paragraph.trim().replace(/\s+/g, ' ');
    const correctWordsCount = getCorrectWordsCount(input, normalizedParagraph);

    return (
        <div className="space-y-4 bg-[#10151a] p-6 rounded-xl shadow-lg border border-green-900/40">
            <div className="p-4 border border-green-900/40 rounded-md leading-7 bg-[#181f26] shadow-inner">
                {getColorizedParagraph()}
            </div>
            <textarea
                value={input}
                onChange={handleChange}
                className="w-full p-3 border border-green-900/40 rounded-md resize-none bg-[#181f26] text-green-200 placeholder:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/70 font-mono text-lg transition"
                placeholder="Start typing..."
                rows={5}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
            />
            <div className="text-sm flex items-center gap-6">
                <span className="text-green-400 font-semibold">
                    Current WPM: <span className="font-mono text-2xl text-green-500 drop-shadow-glow">{wpm}</span>
                </span>
                <span className="text-xs text-green-700 bg-green-900/30 px-2 py-1 rounded">
                    Correct words: {correctWordsCount}
                </span>
            </div>
        </div>
    );
}
