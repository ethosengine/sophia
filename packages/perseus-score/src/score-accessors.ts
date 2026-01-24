/**
 * Lazy accessors for scoring functions that would otherwise create circular dependencies.
 *
 * This breaks circular dependencies between:
 * - score.ts (imports widget-registry)
 * - validate.ts (imports widget-registry)
 * - widget-registry.ts (imports group/score-group, group/validate-group)
 * - group/score-group.ts (needs scoreWidgetsFunctional)
 * - group/validate-group.ts (needs emptyWidgetsFunctional)
 *
 * Usage:
 * 1. index.ts calls setScoreAccessors() after all modules are loaded
 * 2. group scorers/validators use the lazy accessors
 */

import type {
    PerseusScore,
    PerseusWidgetsMap,
    UserInputMap,
} from "@ethosengine/perseus-core";

type ScoreWidgetsFn = (
    widgets: PerseusWidgetsMap,
    widgetIds: ReadonlyArray<string>,
    userInputMap: UserInputMap,
    locale: string,
) => {[widgetId: string]: PerseusScore};

type EmptyWidgetsFn = (
    widgets: PerseusWidgetsMap,
    widgetIds: ReadonlyArray<string>,
    userInputMap: UserInputMap,
    locale: string,
) => ReadonlyArray<string>;

let _scoreWidgetsFunctional: ScoreWidgetsFn | null = null;
let _emptyWidgetsFunctional: EmptyWidgetsFn | null = null;

/**
 * Called by index.ts to register the accessor functions.
 * Must be called before any group scoring/validation.
 */
export function setScoreAccessors(accessors: {
    scoreWidgetsFunctional: ScoreWidgetsFn;
    emptyWidgetsFunctional: EmptyWidgetsFn;
}): void {
    _scoreWidgetsFunctional = accessors.scoreWidgetsFunctional;
    _emptyWidgetsFunctional = accessors.emptyWidgetsFunctional;
}

/**
 * Get the scoreWidgetsFunctional function.
 * Throws if not initialized.
 */
export function getScoreWidgetsFunctional(): ScoreWidgetsFn {
    if (!_scoreWidgetsFunctional) {
        throw new Error(
            "scoreWidgetsFunctional not initialized. Call setScoreAccessors() first.",
        );
    }
    return _scoreWidgetsFunctional;
}

/**
 * Get the emptyWidgetsFunctional function.
 * Throws if not initialized.
 */
export function getEmptyWidgetsFunctional(): EmptyWidgetsFn {
    if (!_emptyWidgetsFunctional) {
        throw new Error(
            "emptyWidgetsFunctional not initialized. Call setScoreAccessors() first.",
        );
    }
    return _emptyWidgetsFunctional;
}
