"use client";

import { useState } from "react";
import { pipeline } from "@xenova/transformers";

export default function SmolLM2Page() {
    const [prompt, setPrompt] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRun() {
        setLoading(true);
        setOutput("");

        // Load the model locally in the browser
        const generator = await pipeline(
            "text-generation",
            "Xenova/SmolLM2-1.7B-Instruct"
        );

        const result = await generator(prompt, {
            max_new_tokens: 50,
        });

        // Inspect the result structure to find the correct property
        // For most transformers.js pipelines, use result[0].generated_text
        // Handle both possible output types
        if ("generated_text" in result) {
            setOutput(String(result?.generated_text));
        } else if ("generated_texts" in result && Array.isArray(result.generated_texts)) {
            setOutput(String(result?.generated_texts[0] || ""));
        } else {
            setOutput("");
        }
        setLoading(false);
    }

    return (
        <div>
            <h1>Run SmolLM2 in Browser</h1>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
            />
            <button onClick={handleRun} disabled={loading}>
                {loading ? "Generating..." : "Run"}
            </button>
            <pre>{output}</pre>
        </div>
    );
}
