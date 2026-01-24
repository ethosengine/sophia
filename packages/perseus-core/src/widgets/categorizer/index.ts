import getCategorizerPublicWidgetOptions from "./categorizer-util";

import type {PerseusCategorizerWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type CategorizerDefaultWidgetOptions = Pick<
    PerseusCategorizerWidgetOptions,
    "items" | "categories" | "values" | "randomizeItems"
>;

const defaultWidgetOptions: CategorizerDefaultWidgetOptions = {
    items: [],
    categories: [],
    values: [],
    randomizeItems: false,
};

const categorizerWidgetLogic: WidgetLogicWithDefaults<CategorizerDefaultWidgetOptions> =
    {
        name: "categorizer",
        defaultWidgetOptions,
        getPublicWidgetOptions: getCategorizerPublicWidgetOptions,
        accessible: false,
    };

export default categorizerWidgetLogic;
