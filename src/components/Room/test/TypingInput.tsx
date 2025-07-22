"use client";

import { useEffect, useRef, useState } from "react";

interface TypingInputProps {
    sampleText: string;
    onComplete: () => void;
    timeLimit: number;
    onProgress: (wpm: number) => void;
}

export default function TypingInput({
    sampleText,
    onComplete,
    timeLimit,
    onProgress,
}: TypingInputProps) {
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [finished, setFinished] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (input.length === 1 && !startTime) {
            setStartTime(Date.now());
        }

        if (startTime) {
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const wordsTyped = input.trim().split(" ").length;
            const wpm = Math.round((wordsTyped / elapsedSeconds) * 60);
            onProgress(wpm);
        }

        if (input.length >= sampleText.length) {
            setFinished(true);
            onComplete();
        }
    }, [input]);

    return (
        <div className="space-y-4 w-full">
            <div className="text-muted-foreground text-lg whitespace-pre-wrap">
                {sampleText}
            </div>

            <input
                ref={inputRef}
                className="w-full p-3 border rounded-md text-base"
                value={input}
                onChange={(e) => !finished && setInput(e.target.value)}
                disabled={finished}
                placeholder="Start typing here..."
            />

            <div className="flex justify-between text-sm text-muted-foreground">
                <p>
                    Characters typed: {input.length} / {sampleText.length}
                </p>
                {finished ? <p className="text-green-600 font-semibold">Done!</p> : <p>Typing...</p>}
            </div>
        </div>
    );
}
