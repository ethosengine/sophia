import type {PerseusPassageWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type PassageDefaultWidgetOptions = Pick<
    PerseusPassageWidgetOptions,
    "passageTitle" | "passageText" | "footnotes" | "showLineNumbers"
>;

const defaultWidgetOptions: PassageDefaultWidgetOptions = {
    passageTitle: "",
    passageText: "",
    footnotes: "",
    showLineNumbers: true,
};

const passageWidgetLogic: WidgetLogicWithDefaults<PassageDefaultWidgetOptions> =
    {
        name: "passage",
        defaultWidgetOptions,
        accessible: false,
    };

export default passageWidgetLogic;
