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

type CharStat = {
    totalTime: number;
    maxTime: number;
    count: number;
    errors: number;
};

export default function TypingInput({
    roomId,
    paragraph,
    overLimit,
    onTypingStatusChange,
}: TypingInputProps) {
    const [input, setInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [charStats, setCharStats] = useState<Record<string, CharStat>>({});

    const debouncedInput = useDebounce(input, 1000);
    const paragraphRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastKeyTimeRef = useRef<number | null>(null);

    const { data: session } = useSession();

    const normalizedParagraph = paragraph.trim().replace(/\s+/g, " ");

    /* -------------------- Helpers -------------------- */

    const getDurationSeconds = () =>
        startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    const getCorrectWordsCount = (typed: string) => {
        if (!typed.trim()) return 0;
        const typedWords = typed.trim().replace(/\s+/g, " ").split(" ");
        const originalWords = normalizedParagraph.split(" ");

        let count = 0;
        for (let i = 0; i < Math.min(typedWords.length, originalWords.length); i++) {
            if (typedWords[i] === originalWords[i]) count++;
            else break;
        }
        return count;
    };

    const buildCharacterPerformance = () =>
        Object.entries(charStats).map(([char, stat]) => ({
            char,
            avgTimePerChar: stat.totalTime / stat.count,
            maxTimePerChar: stat.maxTime,
            errorFrequency: stat.errors,
        }));

    /* -------------------- Effects -------------------- */

    useEffect(() => {
        if (textareaRef.current && !overLimit) textareaRef.current.focus();
    }, [overLimit]);

    useEffect(() => {
        if (overLimit && startTime) {
            setStartTime(null);
            onTypingStatusChange?.(false);
        }
    }, [overLimit, startTime, onTypingStatusChange]);

    useEffect(() => {
        if (!paragraphRef.current) return;
        const el = paragraphRef.current.querySelector(
            `[data-index="${input.length}"]`
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [input.length]);

    /* -------------------- WPM + API -------------------- */

    useEffect(() => {
        if (!debouncedInput || !startTime || !session?.user?.id || overLimit) return;

        const correctWords = getCorrectWordsCount(debouncedInput);
        if (correctWords === 0) return;

        const minutes = (Date.now() - startTime) / 60000;
        if (minutes <= 0) return;

        const speed = Math.round(correctWords / minutes);
        if (speed < 0 || speed > 200) return;

        setWpm(speed);

        fetch("/api/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "speed",
                roomId,
                userId: session.user.id,
                wpm: speed,
                correctword: correctWords,
                duration: getDurationSeconds(),
                charPerformance: buildCharacterPerformance(),
            }),
        }).catch(console.error);
    }, [debouncedInput]);

    /* -------------------- Input Handling -------------------- */

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (overLimit) return;

        const value = e.target.value;
        const now = Date.now();

        if (!startTime && value.length > 0) {
            setStartTime(now);
            lastKeyTimeRef.current = now;
            onTypingStatusChange?.(true);
        }

        if (
            startTime &&
            lastKeyTimeRef.current &&
            value.length > input.length
        ) {
            const index = value.length - 1;
            const char = value[index];
            const latency = now - lastKeyTimeRef.current;
            const isError = char !== normalizedParagraph[index];

            setCharStats(prev => {
                const stat = prev[char] ?? {
                    totalTime: 0,
                    maxTime: 0,
                    count: 0,
                    errors: 0,
                };

                return {
                    ...prev,
                    [char]: {
                        totalTime: stat.totalTime + latency,
                        maxTime: Math.max(stat.maxTime, latency),
                        count: stat.count + 1,
                        errors: stat.errors + (isError ? 1 : 0),
                    },
                };
            });

            lastKeyTimeRef.current = now;
        }

        if (startTime && value.length === 0) {
            setStartTime(null);
            setWpm(0);
            setCharStats({});
            onTypingStatusChange?.(false);
        }

        setInput(value);
    };

    /* -------------------- UI -------------------- */

    const getColorizedParagraph = () =>
        normalizedParagraph.split("").map((char, idx) => {
            let color = "text-gray-500";
            let bg = "";

            if (idx < input.length) {
                if (input[idx] === char) {
                    color = "text-green-400 font-bold";
                    bg = "bg-green-900/30 rounded";
                } else {
                    color = "text-red-400 font-semibold";
                    bg = "bg-red-900/30 rounded";
                }
            } else if (idx === input.length && !overLimit) {
                color = "text-green-300 font-bold animate-pulse";
                bg = "bg-green-800/60 rounded";
            }

            return (
                <span
                    key={idx}
                    data-index={idx}
                    className={clsx("px-0.5 transition-colors", color, bg)}
                >
                    {char}
                </span>
            );
        });

    const correctWordsCount = getCorrectWordsCount(input);

    return (
        <div className="space-y-4 bg-[#10151a] p-6 rounded-xl border border-green-900/40">
            <div
                ref={paragraphRef}
                className="p-4 bg-[#181f26] rounded-md h-48 overflow-y-auto"
            >
                {getColorizedParagraph()}
            </div>

            <textarea
                ref={textareaRef}
                value={input}
                onChange={handleChange}
                disabled={overLimit}
                rows={5}
                className="w-full p-4 bg-[#181f26] border border-green-900/40 rounded-md text-green-200 font-mono focus:ring-2 focus:ring-green-600"
                placeholder={overLimit ? "Limit reached" : "Start typing..."}
                spellCheck={false}
            />

            <div className="flex gap-6 text-sm">
                <span className="text-green-400 font-semibold">
                    WPM: <span className="text-2xl">{wpm}</span>
                </span>
                <span className="text-green-700">
                    Correct words: {correctWordsCount}
                </span>
            </div>
        </div>
    );
}
