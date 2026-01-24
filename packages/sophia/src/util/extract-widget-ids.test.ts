import {testWidgetIdExtraction} from "../../../../testing/extract-widget-ids-contract-tests";

import {extractWidgetIds} from "./extract-widget-ids";

import type {PerseusRenderer} from "@ethosengine/perseus-core";

testWidgetIdExtraction(
    "the extractWidgetIds function",
    (question: PerseusRenderer) => {
        return extractWidgetIds(question);
    },
);
