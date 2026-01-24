import {
    boolean,
    constant,
    nullable,
    number,
    object,
    optional,
    pipeParsers,
    record,
    string,
    union,
} from "../general-purpose-parsers";
import {convert} from "../general-purpose-parsers/convert";
import {defaulted} from "../general-purpose-parsers/defaulted";

import {
    parsePerseusRendererLazy,
    parseWidgetsMapLazy,
} from "./parser-accessors";
import {parseWidget} from "./widget";

const falseToNull = pipeParsers(constant(false)).then(
    convert(() => null),
).parser;
export const parseGradedGroupWidgetOptions = object({
    title: defaulted(string, () => ""),
    hasHint: optional(nullable(boolean)),
    hint: union(falseToNull)
        .or(constant(null))
        .or(constant(undefined))
        .or(parsePerseusRendererLazy).parser,
    content: string,
    widgets: parseWidgetsMapLazy,
    widgetEnabled: optional(nullable(boolean)),
    immutableWidgets: optional(nullable(boolean)),
    images: record(
        string,
        object({
            width: number,
            height: number,
        }),
    ),
});

export const parseGradedGroupWidget = parseWidget(
    constant("graded-group"),
    parseGradedGroupWidgetOptions,
);
