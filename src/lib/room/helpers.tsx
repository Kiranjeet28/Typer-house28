import { customParagraphs, largeText, mediumText, smallText, tenMinuteText } from "@/resources/text";

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

    if (textLength === "SHORT") return smallText;
    if (textLength === "MEDIUM") return mediumText;
    if (textLength === "HARD") return largeText;
    return tenMinuteText || customParagraphs.join(" ");
};
