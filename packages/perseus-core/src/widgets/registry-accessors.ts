/**
 * Lazy accessors for widget registry functions.
 *
 * This module provides access to registry functions without importing
 * widget logic modules, breaking circular dependencies between:
 * - core-widget-registry.ts (imports widget logic)
 * - widget logic modules (like group-util.ts)
 * - apply-defaults.ts (needs registry functions)
 * - split-perseus-renderer.ts (needs registry functions)
 *
 * Usage:
 * 1. core-widget-registry.ts calls setRegistryAccessors() after creating the registry
 * 2. apply-defaults.ts and split-perseus-renderer.ts import from here
 */

import type {PublicWidgetOptionsFunction} from "./logic-export.types";
import type {PerseusWidgetsMap, Version} from "../data-schema";
import type {Alignment} from "../types";

// Types for the accessor functions
type GetPublicWidgetOptionsFn = (type: string) => PublicWidgetOptionsFunction;
type ApplyDefaultsToWidgetsFn = (
    widgets: PerseusWidgetsMap,
) => PerseusWidgetsMap;
type GetCurrentVersionFn = (type: string) => Version;
type GetDefaultWidgetOptionsFn = (type: string) => Record<string, unknown>;
type GetSupportedAlignmentsFn = (type: string) => ReadonlyArray<Alignment>;
type IsWidgetRegisteredFn = (type: string) => boolean;

// Accessors set by core-widget-registry.ts at initialization time
let _getPublicWidgetOptionsFunction: GetPublicWidgetOptionsFn | null = null;
let _applyDefaultsToWidgets: ApplyDefaultsToWidgetsFn | null = null;
let _getCurrentVersion: GetCurrentVersionFn | null = null;
let _getDefaultWidgetOptions: GetDefaultWidgetOptionsFn | null = null;
let _getSupportedAlignments: GetSupportedAlignmentsFn | null = null;
let _isWidgetRegistered: IsWidgetRegisteredFn | null = null;

/**
 * Called by core-widget-registry.ts to provide the accessor functions.
 * Must be called before any code that uses these accessors.
 */
export function setRegistryAccessors(accessors: {
    getPublicWidgetOptionsFunction: GetPublicWidgetOptionsFn;
    applyDefaultsToWidgets: ApplyDefaultsToWidgetsFn;
    getCurrentVersion: GetCurrentVersionFn;
    getDefaultWidgetOptions: GetDefaultWidgetOptionsFn;
    getSupportedAlignments: GetSupportedAlignmentsFn;
    isWidgetRegistered: IsWidgetRegisteredFn;
}): void {
    _getPublicWidgetOptionsFunction = accessors.getPublicWidgetOptionsFunction;
    _applyDefaultsToWidgets = accessors.applyDefaultsToWidgets;
    _getCurrentVersion = accessors.getCurrentVersion;
    _getDefaultWidgetOptions = accessors.getDefaultWidgetOptions;
    _getSupportedAlignments = accessors.getSupportedAlignments;
    _isWidgetRegistered = accessors.isWidgetRegistered;
}

/**
 * Get the public widget options function for a given widget type.
 * Falls back to identity function if registry not initialized or widget not found.
 */
export function getPublicWidgetOptionsFunction(
    type: string,
): PublicWidgetOptionsFunction {
    if (!_getPublicWidgetOptionsFunction) {
        return <T>(i: T): T => i;
    }
    return _getPublicWidgetOptionsFunction(type);
}

/**
 * Apply defaults to widgets map.
 * Returns input unchanged if registry not initialized.
 */
export function applyDefaultsToWidgets(
    widgets: PerseusWidgetsMap,
): PerseusWidgetsMap {
    if (!_applyDefaultsToWidgets) {
        return widgets;
    }
    return _applyDefaultsToWidgets(widgets);
}

/**
 * Get the current version for a widget type.
 * Returns {major: 0, minor: 0} if registry not initialized.
 */
export function getCurrentVersion(type: string): Version {
    if (!_getCurrentVersion) {
        return {major: 0, minor: 0};
    }
    return _getCurrentVersion(type);
}

/**
 * Get the default widget options for a widget type.
 * Returns empty object if registry not initialized.
 */
export function getDefaultWidgetOptions(type: string): Record<string, unknown> {
    if (!_getDefaultWidgetOptions) {
        return {};
    }
    return _getDefaultWidgetOptions(type);
}

/**
 * Get the supported alignments for a widget type.
 * Returns ["default"] if registry not initialized.
 */
export function getSupportedAlignments(type: string): ReadonlyArray<Alignment> {
    if (!_getSupportedAlignments) {
        return ["default"];
    }
    return _getSupportedAlignments(type);
}

/**
 * Check if a widget type is registered.
 * Returns false if registry not initialized.
 */
export function isWidgetRegistered(type: string): boolean {
    if (!_isWidgetRegistered) {
        return false;
    }
    return _isWidgetRegistered(type);
}
