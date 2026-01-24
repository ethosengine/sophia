import type {PerseusPythonProgramWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type PythonProgramDefaultWidgetOptions = Pick<
    PerseusPythonProgramWidgetOptions,
    "programID" | "height"
>;

const defaultWidgetOptions: PythonProgramDefaultWidgetOptions = {
    programID: "",
    height: 400,
};

const pythonProgramWidgetLogic: WidgetLogicWithDefaults<PythonProgramDefaultWidgetOptions> =
    {
        name: "python-program",
        defaultWidgetOptions,
        accessible: true,
    };

export default pythonProgramWidgetLogic;
