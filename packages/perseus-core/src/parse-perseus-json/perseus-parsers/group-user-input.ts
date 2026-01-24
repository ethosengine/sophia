import {parseUserInputMapLazy} from "./parser-accessors";

import type {PerseusGroupUserInput} from "../../validation.types";
import type {Parser} from "../parser-types";

export const parseGroupUserInput: Parser<PerseusGroupUserInput> =
    parseUserInputMapLazy;
