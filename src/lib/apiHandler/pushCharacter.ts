import {
    getFinalCharacterPerformance,
    hasCharacterData,
    resetCharacterStore,
} from "@/lib/store/characterStore";

export async function pushCharacterPerformance(
    typingSpeedId: string,
    userId: string
) {
    if (!hasCharacterData()) return;

    const characters = getFinalCharacterPerformance();
    if (characters.length === 0) return;

    await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action : "charPerformance",
            typingSpeedId,
            userId,
            characters,
        }),
    });

    resetCharacterStore();
}
