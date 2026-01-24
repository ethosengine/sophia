import getNumericInputPublicWidgetOptions from "./numeric-input-util";

import type {PerseusNumericInputWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type NumericInputDefaultWidgetOptions = Pick<
    PerseusNumericInputWidgetOptions,
    "answers" | "size" | "coefficient" | "labelText" | "rightAlign"
>;

const defaultWidgetOptions: NumericInputDefaultWidgetOptions = {
    answers: [
        {
            value: null,
            status: "correct",
            message: "",
            simplify: "required",
            answerForms: [],
            strict: false,
            maxError: null,
        },
    ],
    size: "normal",
    coefficient: false,
    labelText: "",
    rightAlign: false,
};

const numericInputWidgetLogic: WidgetLogicWithDefaults<NumericInputDefaultWidgetOptions> =
    {
        name: "numeric-input",
        defaultWidgetOptions,
        defaultAlignment: "inline-block",
        getPublicWidgetOptions: getNumericInputPublicWidgetOptions,
        accessible: true,
    };

export default numericInputWidgetLogic;
