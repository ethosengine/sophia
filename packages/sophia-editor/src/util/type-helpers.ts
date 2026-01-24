/**
 * Type helper utilities for sophia-editor
 *
 * These utilities help with common type narrowing and assertion patterns
 * to eliminate @ts-expect-error suppressions.
 */

import type * as React from "react";

/**
 * Type guard for non-null and non-undefined values
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Assert that a value is defined, throwing if it's null or undefined.
 * Use this when you know a value must exist at runtime.
 */
export function assertDefined<T>(
    value: T | null | undefined,
    message?: string,
): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error(message ?? "Value is not defined");
    }
}

/**
 * Safely access a property on a potentially null/undefined object.
 * Returns undefined if the object is null/undefined.
 */
export function safeGet<T, K extends keyof T>(
    obj: T | null | undefined,
    key: K,
): T[K] | undefined {
    return obj?.[key];
}

/**
 * Type guard to check if a value is a specific string literal from a union type.
 * Useful for narrowing string types to specific literals.
 *
 * @example
 * const validTypes = ["text", "number", "tel"] as const;
 * if (isOneOf(inputType, validTypes)) {
 *   // inputType is now "text" | "number" | "tel"
 * }
 */
export function isOneOf<T extends readonly string[]>(
    value: string,
    validValues: T,
): value is T[number] {
    return (validValues as readonly string[]).includes(value);
}

/**
 * Helper type for extracting the element type of an array
 */
export type ElementOf<T extends readonly unknown[]> =
    T extends readonly (infer E)[] ? E : never;

/**
 * Type for React ref objects that may or may not be assigned
 */
export type MaybeRef<T> = React.RefObject<T> | {current: T | null};

/**
 * Safely get the current value of a ref, with type narrowing
 */
export function getRefCurrent<T>(
    ref: MaybeRef<T> | null | undefined,
): T | null {
    return ref?.current ?? null;
}

/**
 * Execute a callback with the ref's current value if it exists
 */
export function withRef<T, R>(
    ref: MaybeRef<T> | null | undefined,
    callback: (current: T) => R,
): R | undefined {
    const current = getRefCurrent(ref);
    if (current !== null) {
        return callback(current);
    }
    return undefined;
}

/**
 * Type for objects that have a serialize method (common in editor components)
 */
export interface Serializable {
    serialize(): unknown;
}

/**
 * Type for objects that have a getSaveWarnings method (common in editor components)
 */
export interface HasSaveWarnings {
    getSaveWarnings(): readonly string[];
}

/**
 * Type for objects that are focusable
 */
export interface Focusable {
    focus(): void;
}

/**
 * Type guard for checking if a React instance has a serialize method
 */
export function hasSerialize(instance: unknown): instance is Serializable {
    return (
        instance !== null &&
        typeof instance === "object" &&
        "serialize" in instance &&
        typeof (instance as Serializable).serialize === "function"
    );
}

/**
 * Type guard for checking if a React instance has getSaveWarnings
 */
export function hasGetSaveWarnings(
    instance: unknown,
): instance is HasSaveWarnings {
    return (
        instance !== null &&
        typeof instance === "object" &&
        "getSaveWarnings" in instance &&
        typeof (instance as HasSaveWarnings).getSaveWarnings === "function"
    );
}

/**
 * Type guard for checking if an element is focusable
 */
export function isFocusable(element: unknown): element is Focusable {
    return (
        element !== null &&
        typeof element === "object" &&
        "focus" in element &&
        typeof (element as Focusable).focus === "function"
    );
}

/**
 * Parse a string to a number, returning undefined if invalid.
 * Useful for form input values that should be numbers.
 */
export function parseNumberOrUndefined(value: string): number | undefined {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parse a string to an integer, returning undefined if invalid.
 */
export function parseIntOrUndefined(
    value: string,
    radix = 10,
): number | undefined {
    const parsed = parseInt(value, radix);
    return isNaN(parsed) ? undefined : parsed;
}
