/**
 * Scoring Strategy Abstraction
 *
 * Defines the interface for different scoring strategies (mastery, discovery, reflection).
 * Enables sophia (rendering) to be decoupled from specific scoring implementations.
 *
 * @packageDocumentation
 */

import type {
    Recognition,
    MasteryResult,
    ResonanceResult,
    ReflectionResult,
    Moment,
} from "./types";
import type {
    PerseusRenderer,
    PerseusScore,
    UserInputMap,
} from "@ethosengine/perseus-core";

// ─────────────────────────────────────────────────────────────────────────────
// Widget Scoring Result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of scoring a single widget.
 * Wraps PerseusScore with additional metadata.
 */
export interface WidgetScoringResult {
    /** The widget ID that was scored */
    widgetId: string;
    /** The underlying Perseus score */
    perseusScore: PerseusScore;
    /** Whether this widget contributes to the final score */
    isScoreable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Strategy Interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A ScoringStrategy defines how to process user input and produce Recognition.
 *
 * Different strategies serve different assessment purposes:
 * - Mastery: Did the learner demonstrate understanding? (graded)
 * - Discovery: What resonates with the learner? (subscale contributions)
 * - Reflection: No scoring - just capture the response
 */
export interface ScoringStrategy {
    /** Unique identifier for this strategy */
    readonly id: string;

    /** Human-readable name */
    readonly name: string;

    /**
     * Get the IDs of widgets that are considered "empty" (not filled in).
     * Used to determine if the user can submit their response.
     *
     * @param content - The Perseus content to check
     * @param userInput - The user's input for each widget
     * @param locale - Locale for number parsing
     * @returns Array of widget IDs that are empty
     */
    getEmptyWidgetIds(
        content: PerseusRenderer,
        userInput: UserInputMap,
        locale: string,
    ): ReadonlyArray<string>;

    /**
     * Score/recognize the user's response and produce a Recognition.
     *
     * @param moment - The Moment being assessed
     * @param userInput - The user's input for each widget
     * @param locale - Locale for number parsing
     * @returns A Recognition with mastery or resonance result
     */
    recognize(
        moment: Moment,
        userInput: UserInputMap,
        locale: string,
    ): Recognition;

    /**
     * Optional: Score a single widget.
     * Used for live validation feedback during interaction.
     *
     * @param widgetId - The ID of the widget to score
     * @param widgetType - The type of widget (e.g., "radio", "input-number")
     * @param options - The widget's options/rubric
     * @param input - The user's input for this widget
     * @param locale - Locale for number parsing
     * @returns Widget scoring result, or undefined if not supported
     */
    scoreWidget?(
        widgetId: string,
        widgetType: string,
        options: unknown,
        input: unknown,
        locale: string,
    ): WidgetScoringResult | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// No-Op Strategy (for reflection mode)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A no-op scoring strategy for reflection mode.
 * Simply captures the response without any scoring or subscale mapping.
 */
export const NoOpScoringStrategy: ScoringStrategy = {
    id: "noop",
    name: "Reflection (No Scoring)",

    getEmptyWidgetIds(
        _content: PerseusRenderer,
        _userInput: UserInputMap,
        _locale: string,
    ): ReadonlyArray<string> {
        // In reflection mode, nothing is "required"
        return [];
    },

    recognize(
        moment: Moment,
        userInput: UserInputMap,
        _locale: string,
    ): Recognition {
        // Create a Recognition with no mastery or resonance - just the input
        return {
            momentId: moment.id,
            purpose: "reflection",
            userInput,
            timestamp: Date.now(),
        };
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a Recognition has a mastery result.
 */
export function hasMasteryResult(
    recognition: Recognition,
): recognition is Recognition & {mastery: MasteryResult} {
    return recognition.mastery !== undefined;
}

/**
 * Check if a Recognition has a resonance result.
 */
export function hasResonanceResult(
    recognition: Recognition,
): recognition is Recognition & {resonance: ResonanceResult} {
    return recognition.resonance !== undefined;
}

/**
 * Check if a Recognition has a reflection result.
 */
export function hasReflectionResult(
    recognition: Recognition,
): recognition is Recognition & {reflection: ReflectionResult} {
    return recognition.reflection !== undefined;
}
