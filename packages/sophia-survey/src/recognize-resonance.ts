/**
 * Resonance Recognition
 *
 * Recognizes what resonates with learners in discovery assessments.
 * There is no "correct" answer - only what calls to the learner.
 */

import type {UserInputMap} from "@khanacademy/perseus-core";
import type {
    Moment,
    Recognition,
    ResonanceResult,
    SubscaleContribution,
} from "@ethosengine/sophia-core";
import {createRecognition} from "@ethosengine/sophia-core";

/**
 * User input for a radio widget.
 * Perseus stores selected choices as an array of IDs.
 */
interface RadioUserInput {
    choicesSelected?: boolean[];
    selectedChoiceIds?: string[];
}

/**
 * Recognize resonance from a discovery Moment interaction.
 *
 * Unlike mastery assessment, there is no "correct" answer.
 * Instead, we recognize what subscales the learner's choices
 * contribute to, revealing their affinities and interests.
 *
 * @param moment - The discovery moment with subscale mappings
 * @param userInput - The learner's input
 * @returns A Recognition with resonance result
 */
export function recognizeResonance(
    moment: Moment,
    userInput: UserInputMap,
): Recognition {
    const subscaleContributions: SubscaleContribution = {};
    const selectedChoiceIds: string[] = [];

    // Process each widget's input
    for (const [widgetId, input] of Object.entries(userInput)) {
        const widgetMappings = moment.subscaleContributions?.[widgetId];
        if (!widgetMappings) continue;

        // Handle radio widget input
        const radioInput = input as RadioUserInput | undefined;
        if (!radioInput) continue;

        // Get selected choice IDs
        const choiceIds = getSelectedChoiceIds(radioInput, widgetId);
        selectedChoiceIds.push(...choiceIds);

        // Accumulate subscale contributions from selected choices
        for (const choiceId of choiceIds) {
            const choiceContributions = widgetMappings[choiceId];
            if (choiceContributions) {
                for (const [subscale, value] of Object.entries(
                    choiceContributions,
                )) {
                    subscaleContributions[subscale] =
                        (subscaleContributions[subscale] ?? 0) + value;
                }
            }
        }
    }

    const resonance: ResonanceResult = {
        subscaleContributions,
        selectedChoiceIds:
            selectedChoiceIds.length > 0 ? selectedChoiceIds : undefined,
    };

    return createRecognition(moment.id, "discovery", userInput, {
        resonance,
        timestamp: Date.now(),
    });
}

/**
 * Extract selected choice IDs from radio widget input.
 * Handles both old (choicesSelected boolean array) and new (selectedChoiceIds) formats.
 */
function getSelectedChoiceIds(
    input: RadioUserInput,
    widgetId: string,
): string[] {
    // New format: explicit choice IDs
    if (input.selectedChoiceIds && input.selectedChoiceIds.length > 0) {
        return input.selectedChoiceIds;
    }

    // Old format: boolean array of selected indices
    if (input.choicesSelected) {
        const selected: string[] = [];
        input.choicesSelected.forEach((isSelected, index) => {
            if (isSelected) {
                // Generate a choice ID from index (matching Perseus convention)
                selected.push(`${widgetId}-choice-${index}`);
            }
        });
        return selected;
    }

    return [];
}

/**
 * Get the primary subscale from a resonance result.
 * Returns the subscale with the highest contribution.
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

/**
 * Check if a recognition has any resonance data.
 */
export function hasResonance(recognition: Recognition): boolean {
    const contributions = recognition.resonance?.subscaleContributions;
    return contributions !== undefined && Object.keys(contributions).length > 0;
}
