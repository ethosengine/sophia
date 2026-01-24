/**
 * Event helper utilities for sophia-editor
 *
 * These utilities provide properly typed event handlers to eliminate
 * type mismatches between React event handler types.
 */
import type * as React from "react";

/**
 * Supported input element types for change events
 */
type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/**
 * Extract the value from a change event.
 * Works with input, textarea, and select elements.
 */
export function getInputValue(e: React.ChangeEvent<InputElement>): string {
    return e.target.value;
}

/**
 * Extract a numeric value from a change event.
 * Returns undefined if the value is not a valid number.
 */
export function getInputNumberValue(
    e: React.ChangeEvent<InputElement>,
): number | undefined {
    const value = e.target.value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
}

/**
 * Extract the checked state from a checkbox change event.
 */
export function getCheckboxValue(
    e: React.ChangeEvent<HTMLInputElement>,
): boolean {
    return e.target.checked;
}

/**
 * Create a change handler that extracts the value and calls the callback.
 * This is useful for onChange props that expect a string value rather than an event.
 *
 * @example
 * <input onChange={createValueHandler(this.handleNameChange)} />
 */
export function createValueHandler(
    callback: (value: string) => void,
): React.ChangeEventHandler<InputElement> {
    return (e) => callback(e.target.value);
}

/**
 * Create a change handler for numeric inputs.
 *
 * @example
 * <input type="number" onChange={createNumberHandler(this.handleAgeChange)} />
 */
export function createNumberHandler(
    callback: (value: number) => void,
): React.ChangeEventHandler<InputElement> {
    return (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            callback(value);
        }
    };
}

/**
 * Create a change handler for checkbox inputs.
 *
 * @example
 * <input type="checkbox" onChange={createCheckedHandler(this.handleToggle)} />
 */
export function createCheckedHandler(
    callback: (checked: boolean) => void,
): React.ChangeEventHandler<HTMLInputElement> {
    return (e) => callback(e.target.checked);
}

/**
 * Type adapter for using an HTMLInputElement handler where HTMLSelectElement is expected.
 * Use this when a select element's onChange needs to call a handler typed for input elements.
 *
 * @example
 * <select onChange={adaptSelectHandler(this.handleInputChange)}>
 */
export function adaptSelectHandler(
    handler: React.ChangeEventHandler<HTMLInputElement>,
): React.ChangeEventHandler<HTMLSelectElement> {
    return (e) => {
        // Create a synthetic event that looks like an input event
        // Both have e.target.value which is what handlers typically use
        handler(e as unknown as React.ChangeEvent<HTMLInputElement>);
    };
}

/**
 * Type adapter for using an HTMLSelectElement handler where HTMLInputElement is expected.
 */
export function adaptInputHandler(
    handler: React.ChangeEventHandler<HTMLSelectElement>,
): React.ChangeEventHandler<HTMLInputElement> {
    return (e) => {
        handler(e as unknown as React.ChangeEvent<HTMLSelectElement>);
    };
}

/**
 * Valid HTML input type attributes
 */
export const validInputTypes = [
    "button",
    "checkbox",
    "color",
    "date",
    "datetime-local",
    "email",
    "file",
    "hidden",
    "image",
    "month",
    "number",
    "password",
    "radio",
    "range",
    "reset",
    "search",
    "submit",
    "tel",
    "text",
    "time",
    "url",
    "week",
] as const;

export type InputType = (typeof validInputTypes)[number];

/**
 * Type guard to check if a string is a valid input type
 */
export function isValidInputType(type: string): type is InputType {
    return (validInputTypes as readonly string[]).includes(type);
}

/**
 * Get a valid input type, with fallback to "text" if invalid
 */
export function getValidInputType(type: string): InputType {
    return isValidInputType(type) ? type : "text";
}

/**
 * Type for keyboard event handlers that work with both native and React events
 */
export type KeyboardEventHandler = (
    e: React.KeyboardEvent | KeyboardEvent,
) => void;

/**
 * Create a keyboard handler that triggers on specific keys
 *
 * @example
 * <input onKeyDown={createKeyHandler("Enter", this.handleSubmit)} />
 */
export function createKeyHandler(
    key: string,
    callback: () => void,
): KeyboardEventHandler {
    return (e) => {
        if (e.key === key) {
            callback();
        }
    };
}

/**
 * Create a keyboard handler that triggers on Enter key
 */
export function onEnterKey(callback: () => void): KeyboardEventHandler {
    return createKeyHandler("Enter", callback);
}

/**
 * Create a keyboard handler that triggers on Escape key
 */
export function onEscapeKey(callback: () => void): KeyboardEventHandler {
    return createKeyHandler("Escape", callback);
}
