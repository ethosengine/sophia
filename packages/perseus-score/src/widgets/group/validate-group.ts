import {getWidgetIdsFromContent} from "@ethosengine/perseus-core";

import {getEmptyWidgetsFunctional} from "../../score-accessors";

import type {
    PerseusGroupUserInput,
    PerseusGroupValidationData,
    ValidationResult,
} from "@ethosengine/perseus-core";

function validateGroup(
    userInput: PerseusGroupUserInput | undefined,
    validationData: PerseusGroupValidationData,
    locale: string,
): ValidationResult {
    if (userInput == null) {
        return {type: "invalid", message: null};
    }

    const widgetIds = getWidgetIdsFromContent(validationData.content);
    const emptyWidgets = getEmptyWidgetsFunctional()(
        validationData.widgets,
        widgetIds,
        userInput,
        locale,
    );

    if (emptyWidgets.length === 0) {
        return null;
    }

    return {type: "invalid", message: null};
}

export default validateGroup;
