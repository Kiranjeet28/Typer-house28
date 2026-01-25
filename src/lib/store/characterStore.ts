
export type CharStat = {
    totalTime: number;
    maxTime: number;
    count: number;
    errors: number;
};

type CharMap = Record<string, CharStat>;

let buffer: CharMap = {};

/* ===================== WRITE API (ONLY TypingInput uses this) ===================== */

export function recordCharacter(
    char: string,
    latency: number,
    isError: boolean
) {
    const stat = buffer[char] ?? {
        totalTime: 0,
        maxTime: 0,
        count: 0,
        errors: 0,
    };

    if (isError) {
        stat.errors += 1;
    } else {
        stat.totalTime += latency;
        stat.maxTime = Math.max(stat.maxTime, latency);
        stat.count += 1;
    }

    buffer[char] = stat;
}


/* ===================== READ API (OTHER FILES) ===================== */

export function getFinalCharacterPerformance() {
    return Object.freeze(
        Object.entries(buffer)
            .filter(([, s]) => s.count > 0 || s.errors > 0)
            .map(([char, s]) => ({
                char,
                avgTimePerChar: s.count > 0 ? s.totalTime / s.count : null,
                maxTimePerChar: s.maxTime,
                errorRate:
                    s.errors + s.count > 0
                        ? s.errors / (s.errors + s.count)
                        : 0,
            }))
    );
}

/* ===================== LIFECYCLE ===================== */

export function resetCharacterStore() {
    buffer = {};
}

export function hasCharacterData() {
    return Object.keys(buffer).length > 0;
}
