import { hardText, mediumText, simpleText, hardAlternatives, mediumAlternatives } from "@/resources/text";

export const sendLeaveBeacon = (id: string, session: any) => {
    if (!id || !session?.user?.id) return;

    const payload = JSON.stringify({
        action: "speed",
        roomId: id,
        userStatus: "LEFT",
        userId: session.user.id,
        duration: 0,
        charPerformance: [],
    });

    navigator.sendBeacon("/api/room", payload);
};
export const getTextByTimeLimit = (textLength: string, customText?: string) => {
    if (customText?.trim()) return customText;

    if (textLength === "SHORT") return simpleText;
    if (textLength === "MEDIUM") return mediumText;
    if (textLength === "HARD") return hardText;

    const joinAlternatives = (alt: any) => {
        if (Array.isArray(alt)) return alt.join(" ");
        if (alt && typeof alt === "object") return Object.values(alt).join(" ");
        return String(alt || "");
    };

    return joinAlternatives(hardAlternatives) || joinAlternatives(mediumAlternatives);
};
