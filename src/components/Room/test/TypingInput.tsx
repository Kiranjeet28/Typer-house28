"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
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
    const [correctWordsCount, setCorrectWordsCount] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    const paragraphRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastKeyTimeRef = useRef<number | null>(null);
    const correctWordsRef = useRef(0);

    const { data: session } = useSession();
    const normalizedParagraph = paragraph.trim().replace(/\s+/g, " ");

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

    /* -------------------- WPM API Call (Every 10 seconds on change) -------------------- */

    useEffect(() => {
        if (!startTime || !session?.user?.id || overLimit) return;

        const sendWpmData = () => {
            // Always send current values (including 0s at start)
            const currentCorrectWords = correctWordsRef.current;
            const minutes = (Date.now() - startTime) / 60000;
            
            // Calculate speed (0 if no time has passed or no words)
            const speed = minutes > 0 && currentCorrectWords > 0 
                ? Math.round(currentCorrectWords / minutes) 
                : 0;

            // Cap at reasonable maximum
            const finalSpeed = speed > 250 ? 250 : speed;

            console.log('📤 Sending WPM data:', { 
                wpm: finalSpeed, 
                correctWords: currentCorrectWords, 
                duration: getDurationSeconds() 
            });

            fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "speedWpm",
                    roomId,
                    userId: session.user.id,
                    wpm: finalSpeed,
                    correctword: currentCorrectWords,
                    duration: getDurationSeconds(),
                }),
            }).catch(err => {
                console.error('❌ Failed to send WPM data:', err);
            });
        };

        // Send immediately on start (will send 0 WPM, 0 correct words)
        sendWpmData();

        // Then send every 10 seconds
        const interval = setInterval(sendWpmData, 10000);

        return () => clearInterval(interval);
    }, [startTime, session?.user?.id, overLimit, roomId]);


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