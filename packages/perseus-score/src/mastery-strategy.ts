/**
 * Mastery Scoring Strategy
 *
 * Implements the ScoringStrategy interface for mastery assessment (graded exercises).
 * Wraps the existing Perseus scoring functions.
 *
 * @packageDocumentation
 */

import {createRecognition} from "@ethosengine/sophia-core";

import {scorePerseusItem} from "./score";
import getScoreableWidgets from "./util/get-scoreable-widgets";
import {emptyWidgetsFunctional} from "./validate";

import type {
    PerseusRenderer,
    PerseusScore,
    UserInputMap,
} from "@ethosengine/perseus-core";
import type {
    ScoringStrategy,
    WidgetScoringResult,
    Moment,
    Recognition,
    MasteryResult,
} from "@ethosengine/sophia-core";

/**
 * Convert a Perseus score to a MasteryResult.
 */
function toMasteryResult(perseusScore: PerseusScore): MasteryResult {
    if (perseusScore.type === "points") {
        return {
            demonstrated: perseusScore.earned === perseusScore.total,
            score: perseusScore.earned,
            total: perseusScore.total,
            message: perseusScore.message ?? undefined,
        };
    }

    // Invalid score - treat as not demonstrated
    return {
        demonstrated: false,
        score: 0,
        total: 1,
        message: perseusScore.message ?? undefined,
    };
}

/**
 * Mastery Scoring Strategy
 *
 * Uses Perseus scoring to determine if the learner demonstrated mastery.
 * This is the traditional "correct/incorrect" assessment mode.
 */
export const MasteryScoringStrategy: ScoringStrategy = {
    id: "mastery",
    name: "Mastery Assessment",

    getEmptyWidgetIds(
        content: PerseusRenderer,
        userInput: UserInputMap,
        locale: string,
    ): ReadonlyArray<string> {
        const {upgradedWidgets, scoreableWidgetIds} =
            getScoreableWidgets(content);
        return emptyWidgetsFunctional(
            upgradedWidgets,
            scoreableWidgetIds,
            userInput,
            locale,
        );
    },

    recognize(
        moment: Moment,
        userInput: UserInputMap,
        locale: string,
    ): Recognition {
        // Score the item using Perseus scoring
        const perseusScore = scorePerseusItem(
            moment.content,
            userInput,
            locale,
        );

        // Convert to MasteryResult
        const mastery = toMasteryResult(perseusScore);

        return createRecognition(moment.id, "mastery", userInput, {
            mastery,
            timestamp: Date.now(),
        });
    },

    scoreWidget(
        widgetId: string,
        widgetType: string,
        options: unknown,
        input: unknown,
        locale: string,
    ): WidgetScoringResult | undefined {
        // Import the widget registry dynamically to avoid circular deps
        const {
            getWidgetScorer,
            getWidgetValidator,
            // eslint-disable-next-line @typescript-eslint/no-require-imports
        } = require("./widgets/widget-registry");

        const validator = getWidgetValidator(widgetType);
        const scorer = getWidgetScorer(widgetType);

        // First validate, then score
        const score =
            validator?.(input, options, locale) ??
            scorer?.(input, options, locale);

        if (score) {
            return {
                widgetId,
                perseusScore: score,
                isScoreable: true,
            };
        }

        return undefined;
    },
};
