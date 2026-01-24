/**
 * Input Number Answer Types
 *
 * Metadata about valid answer types for the input-number widget.
 * Used for both UI display (generating examples) and validation.
 */

/**
 * Mapping of answer type names to their configuration.
 * Each type specifies:
 * - name: Human-readable display name
 * - forms: Comma-separated list of valid input forms
 */
export const inputNumberAnswerTypes = {
    number: {
        name: "Numbers",
        forms: "integer, decimal, proper, improper, mixed",
    },
    decimal: {
        name: "Decimals",
        forms: "decimal",
    },
    integer: {
        name: "Integers",
        forms: "integer",
    },
    rational: {
        name: "Fractions and mixed numbers",
        forms: "integer, proper, improper, mixed",
    },
    improper: {
        name: "Improper numbers (no mixed)",
        forms: "integer, proper, improper",
    },
    mixed: {
        name: "Mixed numbers (no improper)",
        forms: "integer, proper, mixed",
    },
    percent: {
        name: "Numbers or percents",
        forms: "integer, decimal, proper, improper, mixed, percent",
    },
    pi: {
        name: "Numbers with pi",
        forms: "pi",
    },
} as const;

export type InputNumberAnswerType = keyof typeof inputNumberAnswerTypes;
