/**
 * Utility functions for type-safe ref access.
 *
 * These helpers provide type guards and safe accessor functions
 * for working with editor component refs, eliminating the need
 * for @ts-expect-error suppressions when accessing ref methods.
 */
import type {
    EditorRef,
    Focusable,
    FrameSender,
    HasSaveWarnings,
    Serializable,
    SerializeOptions,
} from "../types/editor-refs";

/**
 * Type guard for Serializable
 */
export function isSerializable(ref: unknown): ref is Serializable {
    return (
        ref !== null &&
        typeof ref === "object" &&
        "serialize" in ref &&
        typeof (ref as Serializable).serialize === "function"
    );
}

/**
 * Type guard for HasSaveWarnings
 */
export function hasSaveWarnings(ref: unknown): ref is HasSaveWarnings {
    return (
        ref !== null &&
        typeof ref === "object" &&
        "getSaveWarnings" in ref &&
        typeof (ref as HasSaveWarnings).getSaveWarnings === "function"
    );
}

/**
 * Type guard for Focusable
 */
export function isFocusable(ref: unknown): ref is Focusable {
    return (
        ref !== null &&
        typeof ref === "object" &&
        "focus" in ref &&
        typeof (ref as Focusable).focus === "function"
    );
}

/**
 * Type guard for FrameSender
 */
export function isFrameSender(ref: unknown): ref is FrameSender {
    return (
        ref !== null &&
        typeof ref === "object" &&
        "sendNewData" in ref &&
        typeof (ref as FrameSender).sendNewData === "function"
    );
}

/**
 * Type guard for full EditorRef
 */
export function isEditorRef(ref: unknown): ref is EditorRef {
    return isSerializable(ref) && hasSaveWarnings(ref) && isFocusable(ref);
}

/**
 * Safely call serialize on a ref
 */
export function safeSerialize<T = unknown>(
    ref: unknown,
    options?: SerializeOptions,
): T | null {
    if (isSerializable(ref)) {
        return ref.serialize(options) as T;
    }
    return null;
}

/**
 * Safely get save warnings from a ref
 */
export function safeGetSaveWarnings(ref: unknown): string[] {
    if (hasSaveWarnings(ref)) {
        return ref.getSaveWarnings();
    }
    return [];
}

/**
 * Safely focus a ref
 */
export function safeFocus(ref: unknown): boolean {
    if (isFocusable(ref)) {
        ref.focus();
        return true;
    }
    return false;
}

/**
 * Safely send data to an iframe ref
 */
export function safeSendNewData(ref: unknown, data: unknown): boolean {
    if (isFrameSender(ref)) {
        ref.sendNewData(data);
        return true;
    }
    return false;
}
