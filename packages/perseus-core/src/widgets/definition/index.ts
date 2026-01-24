import type {PerseusDefinitionWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type DefinitionDefaultWidgetOptions = Pick<
    PerseusDefinitionWidgetOptions,
    "togglePrompt" | "definition"
>;

const defaultWidgetOptions: DefinitionDefaultWidgetOptions = {
    togglePrompt: "",
    definition: "",
};

const definitionWidgetLogic: WidgetLogicWithDefaults<DefinitionDefaultWidgetOptions> =
    {
        name: "definition",
        defaultWidgetOptions,
        defaultAlignment: "inline",
        accessible: true,
    };

export default definitionWidgetLogic;
