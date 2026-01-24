/**
 * Discovery Scoring Strategy
 *
 * Implements the ScoringStrategy interface for discovery assessment.
 * Maps learner responses to subscale contributions to reveal affinities.
 * There is no "correct" answer - only what resonates with the learner.
 *
 * @packageDocumentation
 */

import {recognizeResonance} from "./recognize-resonance";

import type {PerseusRenderer, UserInputMap} from "@ethosengine/perseus-core";
import type {
    ScoringStrategy,
    Moment,
    Recognition,
} from "@ethosengine/sophia-core";

/**
 * Discovery Scoring Strategy
 *
 * Processes discovery assessment responses to produce resonance results.
 * Unlike mastery, there is no right/wrong - we recognize what resonates
 * with the learner to understand their affinities and interests.
 */
export const DiscoveryScoringStrategy: ScoringStrategy = {
    id: "discovery",
    name: "Discovery Assessment",

    getEmptyWidgetIds(
        content: PerseusRenderer,
        userInput: UserInputMap,
        _locale: string,
    ): ReadonlyArray<string> {
        // In discovery mode, check if any widgets have user input
        // A widget is "empty" if it hasn't been interacted with
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

            const widgetType = widgetConfig.type;
            const input = userInput[widgetId];

            // Check if the widget has meaningful input
            if (isWidgetEmpty(widgetType, input)) {
                emptyWidgets.push(widgetId);
            }
        }

        return emptyWidgets;
    },

    recognize(
        moment: Moment,
        userInput: UserInputMap,
        _locale: string,
    ): Recognition {
        // Use the existing recognizeResonance function
        return recognizeResonance(moment, userInput);
    },

    // No scoreWidget for discovery - there's no per-widget "correctness"
};

/**
 * Check if a widget is empty (no meaningful input).
 */
function isWidgetEmpty(widgetType: string, input: unknown): boolean {
    if (input === undefined || input === null) {
        return true;
    }

    // Handle radio widget
    if (widgetType === "radio") {
        const radioInput = input as {
            choicesSelected?: boolean[];
            selectedChoiceIds?: string[];
        };

        // Check if any choice is selected
        if (
            radioInput.selectedChoiceIds &&
            radioInput.selectedChoiceIds.length > 0
        ) {
            return false;
        }
        if (radioInput.choicesSelected) {
            return !radioInput.choicesSelected.some((selected) => selected);
        }
        return true;
    }

    // Handle dropdown widget
    if (widgetType === "dropdown") {
        const dropdownInput = input as {value?: number | string};
        return dropdownInput.value === undefined || dropdownInput.value === 0;
    }

    // Handle numeric-input widget
    if (widgetType === "numeric-input") {
        const numericInput = input as {currentValue?: string};
        return (
            !numericInput.currentValue ||
            numericInput.currentValue.trim() === ""
        );
    }

    // Handle input-number widget
    if (widgetType === "input-number") {
        const inputNum = input as {currentValue?: string};
        return !inputNum.currentValue || inputNum.currentValue.trim() === "";
    }

    // Handle expression widget
    if (widgetType === "expression") {
        const expressionInput = input as {value?: string};
        return !expressionInput.value || expressionInput.value.trim() === "";
    }

    // Handle orderer widget
    if (widgetType === "orderer") {
        const ordererInput = input as {current?: unknown[]};
        return !ordererInput.current || ordererInput.current.length === 0;
    }

    // Handle sorter widget
    if (widgetType === "sorter") {
        const sorterInput = input as {options?: unknown[]};
        return !sorterInput.options || sorterInput.options.length === 0;
    }

    // For other widget types, assume non-null input means not empty
    return false;
}
