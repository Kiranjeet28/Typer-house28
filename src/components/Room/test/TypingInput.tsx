"use client";

import { useEffect, useState, useRef } from "react";
import RestrictedTextarea from "./textarea";
import { recordCharacter } from "@/lib/store/characterStore";
import { getColorizedParagraph } from "./getColorizedParagraph";
import { getRoomSocket } from "@/lib/room/roomSocket";
import type { TypingMetrics } from "@/lib/room/helpers";

interface TypingInputProps {
    roomId: string;
    paragraph: string;
    overLimit?: boolean;
    onTypingStatusChange?: (isTyping: boolean) => void;
    onMetricsChange?: (metrics: TypingMetrics) => void;
}

export default function TypingInput({
    roomId,
    paragraph,
    overLimit,
    onTypingStatusChange,
    onMetricsChange,
}: TypingInputProps) {
    const [input, setInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [correctWordsCount, setCorrectWordsCount] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    const paragraphRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastKeyTimeRef = useRef<number | null>(null);
    const correctWordsRef = useRef(0);

    useEffect(() => {
        onMetricsChange?.({
            wpm,
            correctword: correctWordsCount,
            duration: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
        });
    }, [wpm, correctWordsCount, startTime, onMetricsChange]);

    const normalizedParagraph = paragraph.trim().replace(/\s+/g, " ");
    const lastSentWpmRef = useRef<number | null>(null);
    const lastSentAtRef = useRef(0);
    const pendingWpmRef = useRef<number | null>(null);
    const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* -------------------- Helpers -------------------- */

    const getDurationSeconds = () =>
        startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    const getCorrectWordsCount = (typed: string) => {
        if (!typed.trim()) return 0;

        const typedText = typed.trim();
        const originalText = normalizedParagraph.trim();

        // Method 1: Character-based calculation for partial progress
        let correctChars = 0;
        const minLength = Math.min(typedText.length, originalText.length);

        for (let i = 0; i < minLength; i++) {
            if (typedText[i] === originalText[i]) {
                correctChars++;
            }
        }

        // Method 2: Count complete correct words for accuracy
        const typedWords = typedText.replace(/\s+/g, " ").split(" ");
        const originalWords = originalText.replace(/\s+/g, " ").split(" ");

        let completeCorrectWords = 0;
        for (let i = 0; i < Math.min(typedWords.length, originalWords.length); i++) {
            if (typedWords[i] === originalWords[i]) {
                completeCorrectWords++;
            }
        }

        // Hybrid approach: Use the greater of the two methods
        // This gives credit for both complete words AND partial progress
        const charBasedWords = correctChars / 5; // Standard WPM calculation (5 chars = 1 word)

        return Math.max(
            completeCorrectWords,
            Math.floor(charBasedWords)
        );
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

    /* -------------------- Typing Status Detection -------------------- */
    useEffect(() => {
        if (!input) return;

        const timeout = setTimeout(() => {
            onTypingStatusChange?.(false);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [input, onTypingStatusChange]);

    /* -------------------- Calculate Correct Words Count -------------------- */
    useEffect(() => {
        const count = getCorrectWordsCount(input);
        setCorrectWordsCount(count);
        correctWordsRef.current = count; // Keep ref in sync
    }, [input, normalizedParagraph]); // Add normalizedParagraph dependency

    /* -------------------- WPM Calculation (Fast UI Update) -------------------- */

    useEffect(() => {
        if (!input || !startTime || overLimit || correctWordsCount === 0) return;

        const minutes = (Date.now() - startTime) / 60000;
        if (minutes <= 0) return;

        const speed = Math.round(correctWordsCount / minutes);
        if (speed <= 0 || speed > 250) return;

        setWpm(speed);
    }, [correctWordsCount, startTime, overLimit, input]);

    /* -------------------- WPM WebSocket Update (At most once per second) -------------------- */

    useEffect(() => {
        const socket = getRoomSocket(roomId);
        const unsubscribe = socket.subscribe(() => undefined);

        return unsubscribe;
    }, [roomId]);

    useEffect(() => {
        if (!startTime || overLimit) {
            pendingWpmRef.current = null;
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
            sendTimerRef.current = null;
            lastSentWpmRef.current = null;
            return;
        }

        const send = () => {
            const nextWpm = pendingWpmRef.current;
            if (nextWpm === null || nextWpm === lastSentWpmRef.current) return;
            getRoomSocket(roomId).send({ type: "WPM_UPDATE", wpm: nextWpm });
            lastSentWpmRef.current = nextWpm;
            lastSentAtRef.current = Date.now();
            pendingWpmRef.current = null;
        };

        pendingWpmRef.current = wpm;
        const wait = Math.max(0, 1000 - (Date.now() - lastSentAtRef.current));
        if (wait === 0) {
            send();
        } else if (!sendTimerRef.current) {
            sendTimerRef.current = setTimeout(() => {
                sendTimerRef.current = null;
                send();
            }, wait);
        }

        return () => {
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
            sendTimerRef.current = null;
        };
    }, [wpm, startTime, overLimit, roomId]);


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
            setCorrectWordsCount(0);
            correctWordsRef.current = 0;
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
                    Correct words: {correctWordsCount}
                </span>
            </div>
        </div>
    );
}