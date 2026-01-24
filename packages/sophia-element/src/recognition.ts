/**
 * Recognition Computation Utility
 *
 * Shared logic for computing Recognition from Moment + UserInput.
 * Used by both the push-based callback (onRecognition) and
 * pull-based method (getRecognition()).
 */

import {
    getScoringStrategy,
    getDefaultScoringStrategy,
} from "@ethosengine/sophia-core";

import type {UserInputMap} from "@ethosengine/perseus-core";
import type {
    Moment,
    Recognition,
    AssessmentPurpose,
} from "@ethosengine/sophia-core";

/**
 * Compute a Recognition from the given Moment and user input.
 *
 * Selects the appropriate scoring strategy based on the moment's purpose
 * and delegates to that strategy for recognition computation.
 *
 * @param moment - The Moment being assessed
 * @param userInput - The user's input for each widget
 * @param locale - Locale for number parsing
 * @returns A Recognition result
 */
export function computeRecognition(
    moment: Moment,
    userInput: UserInputMap,
    locale: string,
): Recognition {
    // Determine the purpose (defaults to mastery if not set)
    const purpose: AssessmentPurpose = moment.purpose || "mastery";

    // Select the appropriate scoring strategy
    const strategyId =
        purpose === "mastery"
            ? "mastery"
            : purpose === "discovery"
              ? "discovery"
              : purpose === "reflection"
                ? "reflection"
                : "noop";

    const strategy =
        getScoringStrategy(strategyId) ?? getDefaultScoringStrategy();

    // Use the strategy to produce Recognition
    return strategy.recognize(moment, userInput, locale);
}

/**
 * Simple equality check for UserInputMap.
 * Used to detect duplicate callbacks and prevent firing
 * the same recognition multiple times.
 *
 * Note: This is a shallow comparison that serializes to JSON.
 * Effective for widget inputs which are simple data structures.
 */
export function userInputEqual(
    a: UserInputMap | null,
    b: UserInputMap | null,
): boolean {
    if (a === b) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }

    // Fast path: compare key counts
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }

    // Deep comparison via JSON serialization
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}
