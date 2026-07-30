import accessible from "./accessible";
import getInteractiveGraphPublicWidgetOptions from "./interactive-graph-util";

import type {
    PerseusInteractiveGraphWidgetOptions,
    PerseusWidgetOptions,
} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type InteractiveGraphDefaultWidgetOptions = Pick<
    PerseusInteractiveGraphWidgetOptions,
    | "labels"
    | "labelLocation"
    | "lockedFigures"
    | "range"
    | "step"
    | "backgroundImage"
    | "markings"
    | "showAxisArrows"
    | "showTooltips"
    | "showProtractor"
    | "graph"
    | "correct"
>;

const defaultWidgetOptions: InteractiveGraphDefaultWidgetOptions = {
    labels: ["$x$", "$y$"],
    labelLocation: "onAxis",
    lockedFigures: [],
    range: [
        [-10, 10],
        [-10, 10],
    ],
    step: [1, 1],
    backgroundImage: {
        url: null,
    },
    markings: "graph",
    showAxisArrows: {
        xMin: true,
        xMax: true,
        yMin: true,
        yMax: true,
    },
    showTooltips: false,
    showProtractor: false,
    graph: {
        type: "linear",
    },
    correct: {
        type: "linear",
        coords: null,
    },
};

const interactiveGraphWidgetLogic: WidgetLogicWithDefaults<InteractiveGraphDefaultWidgetOptions> =
    {
        name: "interactive-graph",
        defaultWidgetOptions,
        getPublicWidgetOptions: getInteractiveGraphPublicWidgetOptions,
        accessible: (widgetOptions: PerseusWidgetOptions): boolean =>
            accessible(widgetOptions as PerseusInteractiveGraphWidgetOptions),
    };

export default interactiveGraphWidgetLogic;
