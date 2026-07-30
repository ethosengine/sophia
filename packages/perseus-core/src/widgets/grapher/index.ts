import getGrapherPublicWidgetOptions from "./grapher-util";

import type {
    PerseusGrapherWidgetOptions,
    PerseusWidgetOptions,
} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type GrapherDefaultWidgetOptions = Pick<
    PerseusGrapherWidgetOptions,
    "graph" | "correct" | "availableTypes"
>;

const defaultWidgetOptions: GrapherDefaultWidgetOptions = {
    graph: {
        labels: ["x", "y"],
        range: [
            [-10, 10],
            [-10, 10],
        ],
        step: [1, 1],
        backgroundImage: {
            url: null,
        },
        markings: "graph",
        rulerLabel: "",
        rulerTicks: 10,
        valid: true,
        showTooltips: false,
    },
    correct: {
        type: "linear",
        coords: null,
    },
    availableTypes: ["linear"],
};

const grapherWidgetLogic: WidgetLogicWithDefaults<GrapherDefaultWidgetOptions> =
    {
        name: "grapher",
        defaultWidgetOptions,
        getPublicWidgetOptions: getGrapherPublicWidgetOptions,
        accessible: (widgetOptions: PerseusWidgetOptions): boolean => {
            // PerseusGrapherWidgetOptions is not a member of the
            // PerseusWidgetOptions union (pre-existing schema gap), so a
            // direct assertion has no structural overlap guarantee here.
            const options =
                widgetOptions as unknown as PerseusGrapherWidgetOptions;
            return (
                !options.graph.backgroundImage.url &&
                options.availableTypes.length === 1 &&
                options.availableTypes[0] !== "quadratic"
            );
        },
    };

export default grapherWidgetLogic;
