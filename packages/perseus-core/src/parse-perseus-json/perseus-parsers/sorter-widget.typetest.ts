import {summon} from "../general-purpose-parsers/test-helpers";

import type {parseSorterWidget} from "./sorter-widget";
import type {SorterWidget} from "../../data-schema";
import type {ParsedValue} from "../parser-types";

type Parsed = ParsedValue<typeof parseSorterWidget>;

// The parser handles a union: full options (with `correct`) and public options
// (with `cards`, produced by splitPerseusItem). SorterWidget only declares the
// full variant, so we verify that direction. The reverse (SorterWidget satisfies
// Parsed) intentionally does not hold because Parsed is a wider union.
summon<SorterWidget>() satisfies Parsed;
