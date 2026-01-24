/**
 * Some tests require some or all of the widgets and editors to be registered
 * in order for them to work. Requiring this file will register all of the
 * widgets and editors.
 */

// Importing from perseus-core triggers registerCoreWidgets() automatically
// eslint-disable-next-line import/no-unassigned-import
import "@ethosengine/perseus-core";

import allWidgets from "../all-widgets";
import * as Widgets from "../widgets";

export const registerAllWidgetsForTesting = () => {
    // Core widgets are registered when @ethosengine/perseus-core is imported
    // Register rendering widgets
    Widgets.registerWidgets(allWidgets);
    Widgets.replaceDeprecatedWidgets();
};
