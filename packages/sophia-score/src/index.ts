/**
 * Sophia Score
 *
 * Tamed mastery assessment that wraps Perseus scoring
 * in Sophia's person-centered model.
 *
 * The key transformation:
 * - Perseus: "Was the answer correct?"
 * - Sophia: "Did the learner demonstrate understanding?"
 *
 * @packageDocumentation
 */

export {
    recognizeMastery,
    hasDemonstrated,
    getMasteryPercentage,
} from "./recognize-mastery";

// Re-export useful types from sophia-core
export type {
    Moment,
    Recognition,
    MasteryResult,
    AggregatedMastery,
    UserInputMap,
} from "@ethosengine/sophia-core";

// Re-export factory functions from sophia-core
export {
    createMasteryMoment,
    createRecognition,
    isMasteryMoment,
} from "@ethosengine/sophia-core";

// Re-export Perseus scoring utilities for advanced use cases
export {
    scorePerseusItem,
    scoreWidgetsFunctional,
    flattenScores,
    validateUserInput,
} from "@khanacademy/perseus-score";
