import {currentVersion, defaultWidgetOptions} from "./passage-ref-upgrade";

import type {WidgetLogicWithDefaults} from "../logic-export.types";
import type {PassageRefDefaultWidgetOptions} from "./passage-ref-upgrade";

export type {PassageRefDefaultWidgetOptions} from "./passage-ref-upgrade";

const passageRefWidgetLogic: WidgetLogicWithDefaults<PassageRefDefaultWidgetOptions> =
    {
        name: "passage-ref",
        version: currentVersion,
        defaultWidgetOptions: defaultWidgetOptions,
        defaultAlignment: "inline",
        accessible: false,
    };

export default passageRefWidgetLogic;
