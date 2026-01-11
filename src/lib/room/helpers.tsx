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
export const getTextByTimeLimit = (seconds: number, customText?: string) => {
    if (customText?.trim()) return customText;

    if (seconds <= 60) return smallText;
    if (seconds <= 180) return mediumText;
    if (seconds <= 300) return largeText;
    return tenMinuteText || customParagraphs.join(" ");
};
