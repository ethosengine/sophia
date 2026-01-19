/**
 * Sophia Core
 *
 * Person-centered assessment foundation supporting both
 * mastery and discovery as first-class modes of interaction.
 *
 * @packageDocumentation
 */

// Core types
export type {
    AssessmentPurpose,
    Moment,
    MomentMetadata,
    SubscaleMappings,
    ChoiceSubscaleMap,
    SubscaleContribution,
    Recognition,
    MasteryResult,
    ResonanceResult,
    AggregatedResonance,
    AggregatedMastery,
} from "./types";

// Re-exported Perseus types
export type {PerseusRenderer, Hint, UserInputMap} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Factory Functions
// ─────────────────────────────────────────────────────────────────────────────

import type {
    Moment,
    MomentMetadata,
    Recognition,
    AssessmentPurpose,
    MasteryResult,
    ResonanceResult,
    SubscaleMappings,
    PerseusRenderer,
    Hint,
    UserInputMap,
} from "./types";

/**
 * Create a new Moment with the given purpose.
 */
export function createMoment(
    id: string,
    purpose: AssessmentPurpose,
    content: PerseusRenderer,
    options?: {
        hints?: Hint[];
        subscaleContributions?: SubscaleMappings;
        metadata?: MomentMetadata;
    },
): Moment {
    return {
        id,
        purpose,
        content,
        hints: options?.hints,
        subscaleContributions: options?.subscaleContributions,
        metadata: options?.metadata,
    };
}

/**
 * Create a mastery moment (for graded assessment).
 */
export function createMasteryMoment(
    id: string,
    content: PerseusRenderer,
    hints?: Hint[],
    metadata?: MomentMetadata,
): Moment {
    return createMoment(id, "mastery", content, {hints, metadata});
}

/**
 * Create a discovery moment (for psychometric assessment).
 */
export function createDiscoveryMoment(
    id: string,
    content: PerseusRenderer,
    subscaleContributions: SubscaleMappings,
    metadata?: MomentMetadata,
): Moment {
    return createMoment(id, "discovery", content, {
        subscaleContributions,
        metadata,
    });
}

/**
 * Create a Recognition result.
 */
export function createRecognition(
    momentId: string,
    purpose: AssessmentPurpose,
    userInput: UserInputMap,
    options?: {
        mastery?: MasteryResult;
        resonance?: ResonanceResult;
        timestamp?: number;
    },
): Recognition {
    return {
        momentId,
        purpose,
        userInput,
        mastery: options?.mastery,
        resonance: options?.resonance,
        timestamp: options?.timestamp ?? Date.now(),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a moment is for mastery assessment.
 */
export function isMasteryMoment(moment: Moment): boolean {
    return moment.purpose === "mastery";
}

/**
 * Check if a moment is for discovery assessment.
 */
export function isDiscoveryMoment(moment: Moment): boolean {
    return moment.purpose === "discovery";
}

/**
 * Check if a recognition indicates demonstrated mastery.
 */
export function hasDemonstrated(recognition: Recognition): boolean {
    return recognition.mastery?.demonstrated ?? false;
}

/**
 * Get the primary subscale from a resonance result.
 */
export function getPrimarySubscale(
    resonance: ResonanceResult,
): string | undefined {
    const entries = Object.entries(resonance.subscaleContributions);
    if (entries.length === 0) return undefined;

    let maxSubscale = entries[0][0];
    let maxValue = entries[0][1];

    for (const [subscale, value] of entries) {
        if (value > maxValue) {
            maxValue = value;
            maxSubscale = subscale;
        }
    }

    return maxSubscale;
}
