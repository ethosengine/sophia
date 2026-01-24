import getDropdownPublicWidgetOptions from "./dropdown-util";

import type {PerseusDropdownWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type DropdownDefaultWidgetOptions = Pick<
    PerseusDropdownWidgetOptions,
    "placeholder" | "choices"
>;

const defaultWidgetOptions: DropdownDefaultWidgetOptions = {
    placeholder: "",
    choices: [
        {
            content: "",
            correct: false,
        },
    ],
};

const dropdownWidgetLogic: WidgetLogicWithDefaults<DropdownDefaultWidgetOptions> =
    {
        name: "dropdown",
        defaultWidgetOptions,
        defaultAlignment: "inline-block",
        getPublicWidgetOptions: getDropdownPublicWidgetOptions,
        accessible: true,
    };

export default dropdownWidgetLogic;
