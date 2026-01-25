import { forwardRef } from "react";

interface RestrictedTextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    overLimit?: boolean;
}

const allowedCharRegex = /^[a-zA-Z0-9 ,.\(\)\{\}"';:]$/;

const controlKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Enter",
    "Home",
    "End",
];

const RestrictedTextarea = forwardRef<
    HTMLTextAreaElement,
    RestrictedTextareaProps
>(({ value, onChange, overLimit = false }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Allow navigation & control keys
        if (controlKeys.includes(e.key)) return;

        // Block non-character keys (Shift, Ctrl, etc.)
        if (e.key.length !== 1) {
            e.preventDefault();
            return;
        }

        // Allow only whitelisted characters
        if (!allowedCharRegex.test(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            disabled={overLimit}
            rows={5}
            spellCheck={false}
            placeholder={overLimit ? "Limit reached" : "Start typing..."}
            className="w-full p-4 bg-[#181f26] border border-green-900/40 rounded-md text-green-200 font-mono focus:ring-2 focus:ring-green-600"
        />
    );
});

RestrictedTextarea.displayName = "RestrictedTextarea";
export default RestrictedTextarea;
