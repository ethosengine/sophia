/**
 * Mastery Recognition
 *
 * Wraps Perseus scoring to recognize what learners demonstrate.
 * Transforms the "correct/incorrect" paradigm into "demonstrated/not yet".
 */

import {scorePerseusItem} from "@ethosengine/perseus-score";
import {createRecognition} from "@ethosengine/sophia-core";

import type {PerseusScore, UserInputMap} from "@ethosengine/perseus-core";
import type {
    Moment,
    Recognition,
    MasteryResult,
} from "@ethosengine/sophia-core";

/**
 * Recognize mastery from a Moment interaction.
 *
 * This function wraps Perseus's scoring system and transforms the result
 * into Sophia's recognition model. The key transformation:
 * - Perseus: "Was the answer correct?"
 * - Sophia: "Did the learner demonstrate understanding?"
 *
 * @param moment - The assessment moment
 * @param userInput - The learner's input
 * @param locale - Locale for number parsing (default: "en")
 * @returns A Recognition with mastery result
 */
export function recognizeMastery(
    moment: Moment,
    userInput: UserInputMap,
    locale: string = "en",
): Recognition {
    // Delegate to Perseus for the actual scoring
    const perseusScore = scorePerseusItem(moment.content, userInput, locale);

    // Transform Perseus score to Sophia mastery result
    const mastery = transformToMasteryResult(perseusScore);

    return createRecognition(moment.id, "mastery", userInput, {
        mastery,
        timestamp: Date.now(),
    });
}

/**
 * Transform a Perseus score to a Sophia mastery result.
 */
function transformToMasteryResult(perseusScore: PerseusScore): MasteryResult {
    if (perseusScore.type === "points") {
        return {
            demonstrated: perseusScore.earned === perseusScore.total,
            score: perseusScore.earned,
            total: perseusScore.total,
            message: perseusScore.message ?? undefined,
        };
    }

    // Invalid responses (empty, malformed) are not demonstrations
    return {
        demonstrated: false,
        score: 0,
        total: 1,
        message: perseusScore.message ?? undefined,
    };
}

/**
 * Check if a recognition indicates demonstrated mastery.
 */
export function hasDemonstrated(recognition: Recognition): boolean {
    return recognition.mastery?.demonstrated ?? false;
}

/**
 * Calculate mastery percentage from a recognition.
 * Returns a value between 0 and 100.
 */
export function getMasteryPercentage(recognition: Recognition): number {
    if (!recognition.mastery) {
        return 0;
    }
    const {score, total} = recognition.mastery;
    if (total === 0) {
        return 0;
    }
    return Math.round((score / total) * 100);
}
