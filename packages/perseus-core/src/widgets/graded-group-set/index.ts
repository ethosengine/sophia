import type {PerseusGradedGroupSetWidgetOptions} from "../../data-schema";
import type {WidgetLogicWithDefaults} from "../logic-export.types";

export type GradedGroupSetDefaultWidgetOptions = Pick<
    PerseusGradedGroupSetWidgetOptions,
    "gradedGroups"
>;

const defaultWidgetOptions: GradedGroupSetDefaultWidgetOptions = {
    gradedGroups: [],
};

const traverseChildWidgets = function (props: any, traverseRenderer: any): any {
    return {...props, ...traverseRenderer(props)};
};

const gradedGroupSetWidgetLogic: WidgetLogicWithDefaults<GradedGroupSetDefaultWidgetOptions> =
    {
        name: "graded-group-set",
        defaultWidgetOptions,
        accessible: true,
        traverseChildWidgets: traverseChildWidgets,
    };

export default gradedGroupSetWidgetLogic;
