import {
    array,
    boolean,
    constant,
    enumeration,
    object,
    string,
    union,
} from "../general-purpose-parsers";

import {parseWidget} from "./widget";

// Parse sorter widget options - supports both full options (with `correct`)
// and public options (with `cards`). Public options are produced by
// splitPerseusItem which renames `correct` to `cards` to obscure the answer.
const parseSorterOptions = union(
    // Full widget options (with correct answer)
    object({
        correct: array(string),
        padding: boolean,
        layout: enumeration("horizontal", "vertical"),
    }),
).or(
    // Public widget options (answer obscured, correct -> cards)
    object({
        cards: array(string),
        padding: boolean,
        layout: enumeration("horizontal", "vertical"),
    }),
).parser;

export const parseSorterWidget = parseWidget(
    constant("sorter"),
    parseSorterOptions,
);
