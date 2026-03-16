/**
 * Seeded PRNG based on integer hash mixing.
 * Given the same seed string, always produces the same sequence of numbers.
 */
function seededRandom(seed: string): () => number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
        h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
        h = (h ^ (h >>> 16)) >>> 0;
        return h / 0x100000000;
    };
}

/**
 * Fisher-Yates shuffle with optional seeded PRNG.
 *
 * When `seed` is provided the shuffle is deterministic: the same seed always
 * produces the same permutation. This lets us randomize ballot option order
 * per-voter per-proposal while keeping it reproducible for auditing.
 *
 * When no seed is given, a time-based seed is derived from Date.now() and
 * array length, providing non-deterministic ordering without using the
 * restricted Math.random.
 *
 * Returns a new array; the input is never mutated.
 */
export function randomizeOptions<T>(
    items: ReadonlyArray<T>,
    seed?: string,
): T[] {
    const result = [...items];
    const effectiveSeed = seed != null ? seed : `${Date.now()}-${items.length}`;
    const random = seededRandom(effectiveSeed);

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
    }

    return result;
}
