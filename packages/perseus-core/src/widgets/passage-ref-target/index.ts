import type {PerseusPassageRefTargetWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type PassageRefTargetDefaultWidgetOptions = Pick<
    PerseusPassageRefTargetWidgetOptions,
    "content"
>;

const defaultWidgetOptions: PassageRefTargetDefaultWidgetOptions = {
    content: "",
};

const passageRefTargetWidgetLogic: WidgetLogicWithDefaults<PassageRefTargetDefaultWidgetOptions> =
    {
        name: "passage-ref-target",
        defaultWidgetOptions,
        defaultAlignment: "inline",
        accessible: false,
    };

export default passageRefTargetWidgetLogic;
