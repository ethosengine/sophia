import {
    getDecimalSeparator,
    inputNumberAnswerTypes,
} from "@ethosengine/perseus-core";

import KhanAnswerTypes from "../../util/answer-types";
import {parseTex} from "../../util/tex-wrangler";

import type {
    PerseusInputNumberRubric,
    PerseusInputNumberUserInput,
    PerseusScore,
} from "@ethosengine/perseus-core";

// Re-export for backwards compatibility
export {inputNumberAnswerTypes} from "@ethosengine/perseus-core";

function scoreInputNumber(
    // NOTE(benchristel): userInput can be undefined if the widget has never
    // been interacted with.
    userInput: PerseusInputNumberUserInput | undefined,
    rubric: PerseusInputNumberRubric,
    locale?: string,
): PerseusScore {
    if (userInput == null) {
        return {type: "invalid", message: null};
    }

    if (rubric.answerType == null) {
        rubric.answerType = "number";
    }

    // note(matthewc): this will get immediately parsed again by
    // `KhanAnswerTypes.number.convertToPredicate`, but a string is
    // expected here
    const stringValue = `${rubric.value}`;
    const val = KhanAnswerTypes.number.createValidatorFunctional(stringValue, {
        simplify: rubric.simplify,
        inexact: rubric.inexact || undefined,
        maxError: rubric.maxError,
        forms: inputNumberAnswerTypes[rubric.answerType].forms,
        // Pass locale-specific decimal separator to ensure that
        // we're properly parsing numbers according to the locale.
        ...(locale && {decimal_separator: getDecimalSeparator(locale)}),
    });

    // We may have received TeX; try to parse it before grading.
    // If `currentValue` is not TeX, this should be a no-op.
    const currentValue = parseTex(userInput.currentValue);

    const result = val(currentValue);

    if (result.empty) {
        return {
            type: "invalid",
            message: result.message,
        };
    }
    return {
        type: "points",
        earned: result.correct ? 1 : 0,
        total: 1,
        message: result.message,
    };
}

export default scoreInputNumber;
