import getTablePublicWidgetOptions from "./table-util";

import type {PerseusTableWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type TableDefaultWidgetOptions = Pick<
    PerseusTableWidgetOptions,
    "headers" | "rows" | "columns" | "answers"
>;

const defaultRows = 4;
const defaultColumns = 1;

// initialize a 2D array
// (defaultRows x defaultColumns) of empty strings
const answers = new Array(defaultRows)
    .fill(0)
    .map(() => new Array(defaultColumns).fill(""));

const defaultWidgetOptions: TableDefaultWidgetOptions = {
    headers: [""],
    rows: defaultRows,
    columns: defaultColumns,
    answers: answers,
};

const tableWidgetLogic: WidgetLogicWithDefaults<TableDefaultWidgetOptions> = {
    name: "table",
    defaultWidgetOptions,
    getPublicWidgetOptions: getTablePublicWidgetOptions,
    accessible: true,
};

export default tableWidgetLogic;
