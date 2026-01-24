import type {PerseusPhetSimulationWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type PhetSimulationDefaultWidgetOptions = Pick<
    PerseusPhetSimulationWidgetOptions,
    "url" | "description"
>;

const defaultWidgetOptions: PhetSimulationDefaultWidgetOptions = {
    url: "",
    description: "",
};

const phetSimulationWidgetLogic: WidgetLogicWithDefaults<PhetSimulationDefaultWidgetOptions> =
    {
        name: "phet-simulation",
        defaultWidgetOptions,
        accessible: true,
    };

export default phetSimulationWidgetLogic;
