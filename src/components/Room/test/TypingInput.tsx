"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import RestrictedTextarea from "./textarea";
import { recordCharacter, getFinalCharacterPerformance } from "@/lib/store/characterStore";
import { getColorizedParagraph } from "./getColorizedParagraph";
import { pushCharacterPerformance } from "@/lib/apiHandler/pushCharacter";

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
    const lastInputLengthRef = useRef(0); // ✅ Track previous input length

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

    /* -------------------- Debug Log -------------------- */
    console.log('Character Performance:', getFinalCharacterPerformance());

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
        correctWordsRef.current = count;
    }, [input, normalizedParagraph]);

    /* -------------------- WPM Calculation (Fast UI Update) -------------------- */
    useEffect(() => {
        if (!input || !startTime || overLimit || correctWordsCount === 0) return;

        const minutes = (Date.now() - startTime) / 60000;
        if (minutes <= 0) return;

        const speed = Math.round(correctWordsCount / minutes);
        if (speed <= 0 || speed > 250) return;

        setWpm(speed);
    }, [correctWordsCount, startTime, overLimit, input]);

    /* -------------------- WPM API Call (Every 10 seconds) -------------------- */
    useEffect(() => {
        if (!startTime || !session?.user?.id || overLimit) return;

        const sendWpmData = () => {
            const currentCorrectWords = correctWordsRef.current;
            const minutes = (Date.now() - startTime) / 60000;

            const speed = minutes > 0 && currentCorrectWords > 0
                ? Math.round(currentCorrectWords / minutes)
                : 0;

            const finalSpeed = speed > 250 ? 250 : speed;

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

        sendWpmData();
        const interval = setInterval(sendWpmData, 10000);

        return () => clearInterval(interval);
    }, [startTime, session?.user?.id, overLimit, roomId]);

    /* -------------------- ✅ Push Character Performance on Completion -------------------- */
    useEffect(() => {
        // Check if user completed the paragraph
        if (input.length >= normalizedParagraph.length && session?.user?.id && startTime) {
            console.log('✅ Paragraph completed - pushing character performance');
            pushCharacterPerformance(roomId, session.user.id).catch(err => {
                console.error('❌ Failed to push character performance on completion:', err);
            });
        }
    }, [input.length, normalizedParagraph.length, session?.user?.id, roomId, startTime]);

    /* -------------------- ✅ FIXED: Input Handling -------------------- */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (overLimit) return;

        const value = e.target.value;
        const now = Date.now();
        const previousLength = lastInputLengthRef.current;

        // ✅ Initialize timing on first keystroke
        if (!startTime && value.length > 0) {
            setStartTime(now);
            onTypingStatusChange?.(true);
        }

        // ✅ Record character ONLY on forward typing (not backspace/paste)
        if (value.length === previousLength + 1) {
            const index = value.length - 1;
            const char = value[index];

            // ✅ Calculate latency properly
            const latency = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
            const isError = char !== normalizedParagraph[index];

            console.log('📝 Recording character:', {
                char,
                latency,
                isError,
                index,
                expected: normalizedParagraph[index]
            });

            recordCharacter(char, latency, isError);
        }

        // ✅ Always update lastKeyTime after any input
        lastKeyTimeRef.current = now;
        lastInputLengthRef.current = value.length;

        // Reset when cleared
        if (value.length === 0 && startTime) {
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