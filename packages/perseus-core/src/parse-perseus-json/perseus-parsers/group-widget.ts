import {constant} from "../general-purpose-parsers";

import {parsePerseusRendererLazy} from "./parser-accessors";
import {parseWidget} from "./widget";

export const parseGroupWidget = parseWidget(
    constant("group"),
    parsePerseusRendererLazy,
);
