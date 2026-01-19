/**
 * Sophia Core Types
 *
 * Person-centered assessment types that support both mastery
 * and discovery as first-class modes of interaction.
 *
 * Philosophy: The learner has dignity and is on a path of growth.
 * Mastery assessment serves that path; it doesn't define it.
 */

import type {
    PerseusRenderer,
    Hint,
    UserInputMap,
} from "@khanacademy/perseus-core";

// ─────────────────────────────────────────────────────────────────────────────
// Assessment Purpose
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The lens through which we view an assessment interaction.
 *
 * - mastery: Did the learner demonstrate understanding?
 * - discovery: What resonates with the learner?
 * - reflection: What does the learner think about their learning?
 * - invitation: What calls to the learner?
 */
export type AssessmentPurpose =
    | "mastery"
    | "discovery"
    | "reflection"
    | "invitation";

// ─────────────────────────────────────────────────────────────────────────────
// Moment - The Assessment Interaction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A Moment is an assessment interaction - a point in time where
 * the learner engages with content and we recognize something about them.
 *
 * Named "Moment" rather than "Question" or "Item" because:
 * - Not all moments are questions (some are invitations)
 * - Not all moments have "correct" answers
 * - Each moment is an opportunity for recognition
 */
export interface Moment {
    /** Unique identifier for this moment */
    id: string;

    /** The purpose of this assessment interaction */
    purpose: AssessmentPurpose;

    /** The content and widgets (Perseus format) */
    content: PerseusRenderer;

    /** Optional hints for mastery moments */
    hints?: Hint[];

    /** Subscale contributions for discovery moments */
    subscaleContributions?: SubscaleMappings;

    /** Optional metadata */
    metadata?: MomentMetadata;
}

/**
 * Metadata about a moment for tracking and analytics.
 */
export interface MomentMetadata {
    /** Tags for categorization */
    tags?: string[];

    /** Source content this moment assesses */
    assessesContentId?: string;

    /** Estimated time in seconds */
    estimatedTimeSeconds?: number;

    /** Additional custom metadata */
    [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscale Mappings (for Discovery)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps widget IDs to their subscale contribution mappings.
 * For each widget, maps choice IDs to their subscale contributions.
 */
export type SubscaleMappings = Record<string, ChoiceSubscaleMap>;

/**
 * Maps choice IDs to their subscale contributions.
 */
export type ChoiceSubscaleMap = Record<string, SubscaleContribution>;

/**
 * Contribution to subscales from a single choice.
 * Keys are subscale names, values are contribution amounts (typically 0-1).
 */
export type SubscaleContribution = Record<string, number>;

// ─────────────────────────────────────────────────────────────────────────────
// Recognition - What Emerged from a Moment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What emerged from a Moment interaction.
 *
 * Named "Recognition" rather than "Score" or "Result" because:
 * - We recognize what the learner demonstrated (mastery)
 * - We recognize what resonates with them (discovery)
 * - Recognition honors the learner's dignity
 */
export interface Recognition {
    /** The moment this recognition is for */
    momentId: string;

    /** The purpose that guided this recognition */
    purpose: AssessmentPurpose;

    /** Mastery result (for mastery purpose) */
    mastery?: MasteryResult;

    /** Resonance result (for discovery purpose) */
    resonance?: ResonanceResult;

    /** Raw user input for further processing */
    userInput: UserInputMap;

    /** Timestamp of the interaction */
    timestamp?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mastery Result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result from a mastery assessment.
 * Wraps Perseus scoring in Sophia's language.
 */
export interface MasteryResult {
    /**
     * Whether the learner demonstrated mastery.
     * Named "demonstrated" rather than "correct" because:
     * - Emphasizes the learner's agency and accomplishment
     * - Avoids the judgment implied by "correct/incorrect"
     */
    demonstrated: boolean;

    /** Points earned (for partial credit scenarios) */
    score: number;

    /** Total possible points */
    total: number;

    /** Optional feedback message */
    message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resonance Result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result from a discovery assessment.
 * There is no "correct" - only what resonates with the learner.
 */
export interface ResonanceResult {
    /**
     * Subscale contributions from this interaction.
     * Keys are subscale names (e.g., "governance", "care", "economic").
     * Values are contribution amounts.
     */
    subscaleContributions: Record<string, number>;

    /** The choice(s) the learner selected */
    selectedChoiceIds?: string[];

    /** Optional confidence level (for self-assessment) */
    confidence?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated Results
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregated resonance across multiple moments.
 * Used to determine the learner's primary path/domain.
 */
export interface AggregatedResonance {
    /** Total subscale scores across all moments */
    subscaleTotals: Record<string, number>;

    /** The subscale with the highest total */
    primarySubscale: string;

    /** Number of moments aggregated */
    momentCount: number;

    /** Normalized scores (0-1) for comparison */
    normalizedScores?: Record<string, number>;
}

/**
 * Aggregated mastery across multiple moments.
 * Used to track learning progress.
 */
export interface AggregatedMastery {
    /** Total moments completed */
    totalMoments: number;

    /** Moments where mastery was demonstrated */
    demonstratedCount: number;

    /** Overall mastery percentage (0-100) */
    masteryPercentage: number;

    /** Current streak of demonstrated mastery */
    currentStreak: number;

    /** Target streak for "practiced" attestation */
    targetStreak: number;

    /** Whether the target streak has been achieved */
    streakAchieved: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-export Perseus types for convenience
// ─────────────────────────────────────────────────────────────────────────────

export type {PerseusRenderer, Hint, UserInputMap} from "@khanacademy/perseus-core";
