import getExpressionPublicWidgetOptions from "./expression-util";

import type {PerseusExpressionWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

const currentVersion = {major: 2, minor: 0};

export type ExpressionDefaultWidgetOptions = Pick<
    PerseusExpressionWidgetOptions,
    "answerForms" | "times" | "buttonSets" | "functions"
>;

const defaultWidgetOptions: ExpressionDefaultWidgetOptions = {
    answerForms: [],
    times: false,
    buttonSets: ["basic"],
    functions: ["f", "g", "h"],
};

const expressionWidgetLogic: WidgetLogicWithDefaults<ExpressionDefaultWidgetOptions> =
    {
        name: "expression",
        version: currentVersion,
        defaultWidgetOptions: defaultWidgetOptions,
        defaultAlignment: "inline-block",
        getPublicWidgetOptions: getExpressionPublicWidgetOptions,
        accessible: true,
    };

export default expressionWidgetLogic;
