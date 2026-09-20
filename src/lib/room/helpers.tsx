import { hardText, mediumText, simpleText, hardAlternatives, mediumAlternatives } from "@/resources/text";

export type TypingMetrics = {
    wpm: number;
    correctword: number;
    duration: number;
};

export async function saveTypingResult(
    roomId: string,
    userId: string,
    metrics: TypingMetrics,
    userStatus: "ACTIVE" | "LEFT" = "LEFT",
) {
    const response = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "speedWpm",
            roomId,
            userId,
            ...metrics,
            userStatus,
        }),
    });

    if (!response.ok) throw new Error("Failed to save typing result");
}

export const sendLeaveBeacon = (
    id: string,
    session: any,
    metrics: TypingMetrics = { wpm: 0, correctword: 0, duration: 0 },
) => {
    if (!id || !session?.user?.id) return;

    const payload = JSON.stringify({
        action: "speedWpm",
        roomId: id,
        userStatus: "LEFT",
        userId: session.user.id,
        ...metrics,
    });

    navigator.sendBeacon("/api/room", payload);
};
export const getTextByTimeLimit = (textLength: string, customText?: string) => {
    if (customText?.trim()) return customText;

    if (textLength === "SHORT") return simpleText;
    if (textLength === "MEDIUM") return mediumText;
    if (textLength === "LONG") return hardText;

    const joinAlternatives = (alt: any) => {
        if (Array.isArray(alt)) return alt.join(" ");
        if (alt && typeof alt === "object") return Object.values(alt).join(" ");
        return String(alt || "");
    };

    return joinAlternatives(hardAlternatives) || joinAlternatives(mediumAlternatives);
};
