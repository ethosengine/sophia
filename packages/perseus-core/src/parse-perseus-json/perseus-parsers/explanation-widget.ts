import {boolean, constant, object, string} from "../general-purpose-parsers";
import {defaulted} from "../general-purpose-parsers/defaulted";

import {parseWidgetsMapLazy} from "./parser-accessors";
import {parseWidget} from "./widget";

export const parseExplanationWidget = parseWidget(
    constant("explanation"),
    object({
        showPrompt: string,
        hidePrompt: string,
        explanation: string,
        widgets: defaulted(parseWidgetsMapLazy, () => ({})),
        static: defaulted(boolean, () => false),
    }),
);
