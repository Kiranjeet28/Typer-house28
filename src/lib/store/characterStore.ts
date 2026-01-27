// @/lib/store/characterStore.ts

interface CharacterData {
    char: string;
    totalTime: number;
    maxTime: number;
    count: number;
    errors: number;
}

// ✅ In-memory store for character performance
const characterMap = new Map<string, CharacterData>();

/**
 * Record a character keystroke with its timing and error status
 */
export function recordCharacter(char: string, latency: number, isError: boolean): void {
    console.log(`📊 Recording: "${char}" | ${latency}ms | Error: ${isError}`);

    const existing = characterMap.get(char);

    if (existing) {
        existing.totalTime += latency;
        existing.maxTime = Math.max(existing.maxTime, latency);
        existing.count += 1;
        existing.errors += isError ? 1 : 0;
    } else {
        characterMap.set(char, {
            char,
            totalTime: latency,
            maxTime: latency,
            count: 1,
            errors: isError ? 1 : 0,
        });
    }

    console.log(`📈 Updated stats for "${char}":`, characterMap.get(char));
}

/**
 * Check if we have any character data recorded
 */
export function hasCharacterData(): boolean {
    return characterMap.size > 0;
}

/**
 * Get final character performance data formatted for API
 */
export function getFinalCharacterPerformance() {
    const characters = Array.from(characterMap.values()).map((data) => ({
        char: data.char,
        avgTimePerChar: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
        maxTimePerChar: data.maxTime,
        errorFrequency: data.count > 0 ? Math.round((data.errors / data.count) * 100) : 0,
    }));

    console.log('📤 Final character performance:', characters);
    return characters;
}

/**
 * Reset the character store (call after successful push)
 */
export function resetCharacterStore(): void {
    console.log('🗑️ Resetting character store');
    characterMap.clear();
}

/**
 * Debug: Get current store state
 */
export function getCharacterStoreDebug() {
    return {
        size: characterMap.size,
        data: Array.from(characterMap.entries()),
    };
}