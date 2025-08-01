"use client";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface TypingInputProps {
    roomId: string;
    paragraph: string;
    overLimit?: boolean;
    onTypingStatusChange?: (isTyping: boolean) => void;
}

export default function TypingInput({ roomId, paragraph, overLimit, onTypingStatusChange }: TypingInputProps) {
    const [input, setInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const debouncedInput = useDebounce(input, 1000);
    const { data: session } = useSession();
    const paragraphRef = useRef<HTMLDivElement>(null);

    // Stop typing when overLimit becomes true
    useEffect(() => {
        if (overLimit && startTime) {
            setStartTime(null);
            onTypingStatusChange?.(false);
        }
    }, [overLimit, startTime, onTypingStatusChange]);

    // Auto-scroll paragraph box based on typing progress
    useEffect(() => {
        if (!paragraphRef.current) return;
        
        // Find the current cursor position element
        const currentElement = paragraphRef.current.querySelector(`[data-index="${input.length}"]`);
        if (currentElement) {
            currentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }, [input.length]);

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
        // Don't update WPM if overLimit is true
        if (overLimit || !debouncedInput || !session?.user?.id || !startTime) return;
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
    }, [debouncedInput, session?.user?.id, roomId, startTime, paragraph, overLimit]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Prevent input changes when overLimit is true
        if (overLimit) return;
        
        const newValue = e.target.value;
        
        if (!startTime && newValue.length > 0) {
            setStartTime(Date.now());
            onTypingStatusChange?.(true);
        } else if (startTime && newValue.length === 0) {
            setStartTime(null);
            setWpm(0);
            onTypingStatusChange?.(false);
        }
        
        setInput(newValue);
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
            } else if (idx === input.length && !overLimit) {
                colorClass = "text-green-300 font-bold animate-pulse";
                bgClass = "bg-green-800/60 rounded";
            }
            return (
                <span
                    key={idx}
                    data-index={idx}
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
        <div className=" space-y-4 bg-[#10151a] p-6 rounded-xl shadow-lg border border-green-900/40">
            <div 
                ref={paragraphRef}
                className="p-4 border border-green-900/40 rounded-md leading-7 bg-[#181f26] shadow-inner h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900/20"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#15803d #1f2937'
                }}
            >
                {getColorizedParagraph()}
            </div>
            <textarea
                value={input}
                onChange={handleChange}
                disabled={overLimit}
                className={clsx(
                    "w-full p-3 border border-green-900/40 rounded-md resize-none bg-[#181f26] text-green-200 placeholder:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/70 font-mono text-lg transition",
                    overLimit && "opacity-50 cursor-not-allowed bg-gray-800/50"
                )}
                placeholder={overLimit ? "Typing disabled - limit reached" : "Start typing..."}
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
                {overLimit && (
                    <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded font-semibold">
                        Limit reached
                    </span>
                )}
            </div>
        </div>
    );
}