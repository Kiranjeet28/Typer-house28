import { useRef } from "react";

interface RestrictedTextareaProps {
    ref?: React.Ref<HTMLTextAreaElement>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    overLimit?: boolean;
}

const RestrictedTextarea: React.FC<RestrictedTextareaProps> = ({
    ref,
    value,
    onChange,
    overLimit = false,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Allow only: a-z, A-Z, 0-9, space
    const allowedKeyRegex = /^[a-zA-Z0-9 ,.{}[\]() ]$/;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Block everything except allowed single-character keys
        if (!allowedKeyRegex.test(e.key)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
    };

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onDrop={handleDrop}
            disabled={overLimit}
            rows={5}
            spellCheck={false}
            placeholder={overLimit ? "Limit reached" : "Start typing..."}
            className="w-full p-4 bg-[#181f26] border border-green-900/40 rounded-md text-green-200 font-mono focus:ring-2 focus:ring-green-600"
        />
    );
};

export default RestrictedTextarea;
