/**
 * Reflection Scoring Strategy
 *
 * Implements the ScoringStrategy interface for reflection assessment.
 * Captures user input without grading. Optionally extracts subscale
 * contributions if the moment defines them.
 *
 * Use cases:
 * - Journaling / open-ended responses
 * - Self-assessment without grading
 * - Capturing input for later analysis
 * - Optional subscale contribution tracking
 *
 * @packageDocumentation
 */

import type {PerseusRenderer, UserInputMap} from "@ethosengine/perseus-core";
import type {
    ScoringStrategy,
    Moment,
    Recognition,
    ReflectionResult,
} from "@ethosengine/sophia-core";

/**
 * Reflection Scoring Strategy
 *
 * Processes reflection assessment responses to capture user input.
 * Unlike mastery, there is no right/wrong. Unlike discovery, subscale
 * contributions are optional. We simply recognize what the learner shares.
 */
export const ReflectionScoringStrategy: ScoringStrategy = {
    id: "reflection",
    name: "Reflection",

    getEmptyWidgetIds(
        content: PerseusRenderer,
        userInput: UserInputMap,
        _locale: string,
    ): ReadonlyArray<string> {
        // For reflection, we're more lenient about what counts as "filled"
        // A reflection is valid if the user has interacted at all
        const emptyWidgets: string[] = [];

        if (content.widgets == null) {
            return emptyWidgets;
        }

        for (const [widgetId, widgetConfig] of Object.entries(
            content.widgets,
        )) {
            // Skip non-interactive widgets
            if (widgetConfig == null || widgetConfig.static === true) {
                continue;
            }

            const input = userInput[widgetId];

            // Check for completely empty inputs
            if (input === undefined || input === null) {
                emptyWidgets.push(widgetId);
                continue;
            }

            // Check for empty strings in text inputs
            if (typeof input === "object" && input !== null) {
                // Free response widget
                if ("content" in input) {
                    const content = (input as {content?: string}).content;
                    if (!content || content.trim() === "") {
                        emptyWidgets.push(widgetId);
                    }
                }
            }
        }

        return emptyWidgets;
    },

    recognize(
        moment: Moment,
        userInput: UserInputMap,
        _locale: string,
    ): Recognition {
        const reflection = buildReflectionResult(moment, userInput);

        return {
            momentId: moment.id,
            purpose: "reflection",
            userInput,
            reflection,
            timestamp: Date.now(),
        };
    },

    // No scoreWidget for reflection - there's no per-widget "correctness"
};

/**
 * Build a ReflectionResult from the moment and user input.
 */
function buildReflectionResult(
    moment: Moment,
    userInput: UserInputMap,
): ReflectionResult {
    const result: ReflectionResult = {
        userInput,
        timestamp: Date.now(),
    };

    // Extract subscale contributions if defined
    if (moment.subscaleContributions) {
        result.subscaleContributions = extractSubscaleContributions(
            moment.subscaleContributions,
            userInput,
        );
    }

    // Extract text content from free-response widgets
    const textContent = extractTextContent(userInput);
    if (textContent) {
        result.textContent = textContent;
    }

    return result;
}

/**
 * Extract subscale contributions from user input based on moment mappings.
 */
function extractSubscaleContributions(
    subscaleMap: Record<string, Record<string, Record<string, number>>>,
    userInput: UserInputMap,
): Record<string, number> {
    const contributions: Record<string, number> = {};

    for (const [widgetId, choiceMap] of Object.entries(subscaleMap)) {
        const input = userInput[widgetId];
        if (!input) {
            continue;
        }

        // Handle radio widget input
        if (typeof input === "object" && "choicesSelected" in input) {
            const radioInput = input as {choicesSelected?: boolean[]};
            const selected = radioInput.choicesSelected;
            if (selected) {
                selected.forEach((isSelected, idx) => {
                    if (isSelected) {
                        const choiceKey = `choice-${idx}`;
                        const subscales = choiceMap[choiceKey];
                        if (subscales != null) {
                            for (const [subscale, value] of Object.entries(
                                subscales,
                            )) {
                                contributions[subscale] =
                                    (contributions[subscale] ?? 0) + value;
                            }
                        }
                    }
                });
            }
        }

        // Handle dropdown widget input
        if (typeof input === "object" && "value" in input) {
            const dropdownInput = input as {value?: number | string};
            if (
                dropdownInput.value !== undefined &&
                dropdownInput.value !== 0
            ) {
                const choiceKey = `choice-${dropdownInput.value}`;
                const subscales = choiceMap[choiceKey];
                if (subscales != null) {
                    for (const [subscale, value] of Object.entries(subscales)) {
                        contributions[subscale] =
                            (contributions[subscale] ?? 0) + value;
                    }
                }
            }
        }
    }

    return contributions;
}

/**
 * Extract text content from free-response and text-based widgets.
 */
function extractTextContent(userInput: UserInputMap): string | undefined {
    const textParts: string[] = [];

    for (const input of Object.values(userInput)) {
        if (typeof input === "object" && input !== null) {
            // Free response widget
            if ("content" in input) {
                const content = (input as {content?: string}).content;
                if (content && content.trim()) {
                    textParts.push(content);
                }
            }
            // Input number widget with string value
            if ("currentValue" in input) {
                const currentValue = (input as {currentValue?: string})
                    .currentValue;
                if (currentValue && currentValue.trim()) {
                    textParts.push(currentValue);
                }
            }
        }
    }

    return textParts.length > 0 ? textParts.join("\n") : undefined;
}

export default ReflectionScoringStrategy;
