import getSorterPublicWidgetOptions from "./sorter-util";

import type {PerseusSorterWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type SorterDefaultWidgetOptions = Pick<
    PerseusSorterWidgetOptions,
    "correct" | "layout" | "padding"
>;

const defaultWidgetOptions: SorterDefaultWidgetOptions = {
    correct: ["$x$", "$y$", "$z$"],
    layout: "horizontal",
    padding: true,
};

const sorterWidgetLogic: WidgetLogicWithDefaults<SorterDefaultWidgetOptions> = {
    name: "sorter",
    defaultWidgetOptions,
    getPublicWidgetOptions: getSorterPublicWidgetOptions,
    accessible: false,
};

export default sorterWidgetLogic;
