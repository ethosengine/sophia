/**
 * Lazy accessors for parser functions that would otherwise create circular dependencies.
 *
 * This module provides access to parsers without direct imports, breaking circular
 * dependencies between:
 * - widgets-map.ts (imports widget parsers)
 * - widget parsers (group, graded-group, etc.)
 * - perseus-renderer.ts
 * - user-input-map.ts ↔ group-user-input.ts
 *
 * Usage:
 * 1. parse-perseus-json/index.ts calls setParserAccessors() after all parsers are loaded
 * 2. Widget/user-input parsers use the lazy accessors
 */

import type {PerseusRenderer, PerseusWidgetsMap} from "../../data-schema";
import type {UserInputMap} from "../../validation.types";
import type {Parser} from "../parser-types";

// Accessors set by the entry point after parsers are defined
let _parsePerseusRenderer: Parser<PerseusRenderer> | null = null;
let _parseWidgetsMap: Parser<PerseusWidgetsMap> | null = null;
let _parseUserInputMap: Parser<UserInputMap> | null = null;

/**
 * Called to register the parsers. Must be called before any code uses the getters.
 */
export function setParserAccessors(accessors: {
    parsePerseusRenderer: Parser<PerseusRenderer>;
    parseWidgetsMap: Parser<PerseusWidgetsMap>;
    parseUserInputMap?: Parser<UserInputMap>;
}): void {
    _parsePerseusRenderer = accessors.parsePerseusRenderer;
    _parseWidgetsMap = accessors.parseWidgetsMap;
    if (accessors.parseUserInputMap) {
        _parseUserInputMap = accessors.parseUserInputMap;
    }
}

/**
 * Get the parsePerseusRenderer function.
 * Throws if parsers haven't been registered yet.
 */
export function getParsePerseusRenderer(): Parser<PerseusRenderer> {
    if (!_parsePerseusRenderer) {
        throw new Error(
            "parsePerseusRenderer not initialized. Call setParserAccessors() first.",
        );
    }
    return _parsePerseusRenderer;
}

/**
 * Get the parseWidgetsMap function.
 * Throws if parsers haven't been registered yet.
 */
export function getParseWidgetsMap(): Parser<PerseusWidgetsMap> {
    if (!_parseWidgetsMap) {
        throw new Error(
            "parseWidgetsMap not initialized. Call setParserAccessors() first.",
        );
    }
    return _parseWidgetsMap;
}

/**
 * Parser that delegates to parsePerseusRenderer.
 * Safe to use before setParserAccessors() is called because it
 * only accesses the accessor at parse time, not at module load time.
 */
export const parsePerseusRendererLazy: Parser<PerseusRenderer> = (
    rawVal,
    ctx,
) => getParsePerseusRenderer()(rawVal, ctx);

/**
 * Parser that delegates to parseWidgetsMap.
 * Safe to use before setParserAccessors() is called because it
 * only accesses the accessor at parse time, not at module load time.
 */
export const parseWidgetsMapLazy: Parser<PerseusWidgetsMap> = (rawVal, ctx) =>
    getParseWidgetsMap()(rawVal, ctx);

/**
 * Get the parseUserInputMap function.
 * Throws if parsers haven't been registered yet.
 */
export function getParseUserInputMap(): Parser<UserInputMap> {
    if (!_parseUserInputMap) {
        throw new Error(
            "parseUserInputMap not initialized. Call setParserAccessors() first.",
        );
    }
    return _parseUserInputMap;
}

/**
 * Parser that delegates to parseUserInputMap.
 * Safe to use before setParserAccessors() is called because it
 * only accesses the accessor at parse time, not at module load time.
 */
export const parseUserInputMapLazy: Parser<UserInputMap> = (rawVal, ctx) =>
    getParseUserInputMap()(rawVal, ctx);
