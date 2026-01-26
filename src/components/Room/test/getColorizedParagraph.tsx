import React from "react";
import clsx from "clsx";

export const getColorizedParagraph = (
    normalizedParagraph: string,
    input: string,
    overLimit: boolean
): React.ReactElement[] =>
    normalizedParagraph.split("").map((char: string, idx: number) => {
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
