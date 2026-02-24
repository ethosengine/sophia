import LikertScale from "./likert-scale";

import type {WidgetExports} from "../../types";
import type {PerseusLikertScaleUserInput} from "@ethosengine/perseus-core";

function getStartUserInput(): PerseusLikertScaleUserInput {
    return {value: null};
}

export default {
    name: "likert-scale",
    displayName: "Likert Scale",
    widget: LikertScale,
    getStartUserInput,
    isLintable: false,
} satisfies WidgetExports<typeof LikertScale>;
