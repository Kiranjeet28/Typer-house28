"use client";

import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import RestrictedTextarea from "./textarea";
import { recordCharacter } from "@/lib/store/characterStore";
import { getColorizedParagraph } from "./getColorizedParagraph";

interface TypingInputProps {
    roomId: string;
    paragraph: string;
    overLimit?: boolean;
    onTypingStatusChange?: (isTyping: boolean) => void;
}

export default function TypingInput({
    roomId,
    paragraph,
    overLimit,
    onTypingStatusChange,
}: TypingInputProps) {
    const [input, setInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

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
            if (typedWords[i] === originalWords[i]) {
                count++;
            }
        }
        return count;
    };


    /* -------------------- Focus & Scroll -------------------- */

    useEffect(() => {
        if (textareaRef.current && !overLimit) {
            textareaRef.current.focus();
        }
    }, [overLimit]);

    useEffect(() => {
        if (!paragraphRef.current) return;
        const el = paragraphRef.current.querySelector(
            `[data-index="${input.length}"]`
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [input.length]);

    /* -------------------- WPM API (UNCHANGED) -------------------- */

    useEffect(() => {
        if (!input || !startTime || !session?.user?.id || overLimit) return;

        const correctWords = getCorrectWordsCount(input);
        if (correctWords === 0) return;

        const minutes = (Date.now() - startTime) / 60000;
        if (minutes <= 0) return;

        const speed = Math.round(correctWords / minutes);
        if (speed <= 0 || speed > 250) return;

        setWpm(speed);

        fetch("/api/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "speedWpm",
                roomId,
                userId: session.user.id,
                wpm: speed,
                correctword: correctWords,
                duration: getDurationSeconds(),
            }),
        }).catch(console.error);
    }, [input]);


    /* -------------------- Input Handling -------------------- */

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (overLimit) return;

        const value = e.target.value;
        const now = Date.now();

        // start typing
        if (!startTime && value.length > 0) {
            setStartTime(now);
            lastKeyTimeRef.current = now;
            onTypingStatusChange?.(true);
        }
        useEffect(() => {
            if (!input) return;

            const timeout = setTimeout(() => {
                onTypingStatusChange?.(false);
            }, 2000);

            return () => clearTimeout(timeout);
        }, [input]);

        // ✅ record ONLY forward typing (ignore backspace)
        if (
            startTime &&
            lastKeyTimeRef.current &&
            value.length === input.length + 1
        ) {
            const index = value.length - 1;
            const char = value[index];
            const latency = now - lastKeyTimeRef.current;
            const isError = char !== normalizedParagraph[index];

            recordCharacter(char, latency, isError);
            lastKeyTimeRef.current = now;
        }

        // reset when cleared
        if (startTime && value.length === 0) {
            setStartTime(null);
            setWpm(0);
            lastKeyTimeRef.current = null;
            onTypingStatusChange?.(false);
        }

        setInput(value);
    };

    /* -------------------- UI -------------------- */

    return (
        <div className="space-y-4 bg-[#10151a] p-6 rounded-xl border border-green-900/40">
            <div
                ref={paragraphRef}
                className="p-4 bg-[#181f26] rounded-md h-48 overflow-y-auto"
            >
                {getColorizedParagraph(normalizedParagraph, input, overLimit || false)}
            </div>

            <RestrictedTextarea
                ref={textareaRef}
                value={input}
                onChange={handleChange}
                overLimit={overLimit}
            />

            <div className="flex gap-6 text-sm">
                <span className="text-green-400 font-semibold">
                    WPM: <span className="text-2xl">{wpm}</span>
                </span>
                <span className="text-green-700">
                    Correct words: {getCorrectWordsCount(input)}
                </span>
            </div>
        </div>
    );
}
