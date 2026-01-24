import {
    array,
    constant,
    enumeration,
    object,
    pipeParsers,
} from "../general-purpose-parsers";
import {defaulted} from "../general-purpose-parsers/defaulted";

import {parsePerseusRendererLazy} from "./parser-accessors";
import {parseWidget} from "./widget";

import type {PartialParser} from "../parser-types";

const largeToAuto: PartialParser<
    "normal" | "auto" | "large",
    "normal" | "auto"
> = (height, ctx) => {
    if (height === "large") {
        return ctx.success("auto");
    }
    return ctx.success(height);
};

export const parseOrdererWidget = parseWidget(
    constant("orderer"),
    object({
        options: defaulted(array(parsePerseusRendererLazy), () => []),
        correctOptions: defaulted(array(parsePerseusRendererLazy), () => []),
        otherOptions: defaulted(array(parsePerseusRendererLazy), () => []),
        height: pipeParsers(enumeration("normal", "auto", "large")).then(
            largeToAuto,
        ).parser,
        layout: defaulted(
            enumeration("horizontal", "vertical"),
            () => "horizontal" as const,
        ),
    }),
);
