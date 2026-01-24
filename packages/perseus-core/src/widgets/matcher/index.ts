import getMatcherPublicWidgetOptions from "./matcher-util";

import type {PerseusMatcherWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type MatcherDefaultWidgetOptions = Pick<
    PerseusMatcherWidgetOptions,
    "left" | "right" | "labels" | "orderMatters" | "padding"
>;

const defaultWidgetOptions: MatcherDefaultWidgetOptions = {
    left: ["$x$", "$y$", "$z$"],
    right: ["$1$", "$2$", "$3$"],
    labels: ["test", "label"],
    orderMatters: false,
    padding: true,
};

const matcherWidgetLogic: WidgetLogicWithDefaults<MatcherDefaultWidgetOptions> =
    {
        name: "matcher",
        defaultWidgetOptions,
        getPublicWidgetOptions: getMatcherPublicWidgetOptions,
        accessible: false,
    };

export default matcherWidgetLogic;
