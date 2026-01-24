import {approximateDeepEqual} from "@ethosengine/perseus-core";
import _ from "underscore";

import type {
    PerseusSorterRubric,
    PerseusSorterUserInput,
    PerseusScore,
} from "@ethosengine/perseus-core";

function scoreSorter(
    userInput: PerseusSorterUserInput,
    rubric: PerseusSorterRubric,
): PerseusScore {
    const correct = approximateDeepEqual(userInput.options, rubric.correct);
    return {
        type: "points",
        earned: correct ? 1 : 0,
        total: 1,
        message: null,
    };
}

export default scoreSorter;
