/**
 * Type definitions for editor component refs.
 *
 * These interfaces define the expected methods on editor components
 * that can be accessed via refs, enabling type-safe ref access
 * throughout the sophia-editor package.
 */

/**
 * Options for serialization
 */
export interface SerializeOptions {
    keepDeletedWidgets?: boolean;
}

/**
 * Interface for components that can serialize their state
 */
export interface Serializable<T = unknown> {
    serialize(options?: SerializeOptions): T;
}

/**
 * Interface for components that report save warnings
 */
export interface HasSaveWarnings {
    getSaveWarnings(): string[];
}

/**
 * Interface for focusable editor components
 */
export interface Focusable {
    focus(): void;
}

/**
 * Interface for components that can send data to iframes
 */
export interface FrameSender {
    sendNewData(data: unknown): void;
}

/**
 * Combined interface for full editor functionality
 */
export interface EditorRef extends Serializable, HasSaveWarnings, Focusable {}

/**
 * Type for editor ref that may not be set
 */
export type EditorRefHandle<T extends Partial<EditorRef> = EditorRef> =
    T | null;

/**
 * Type for frame ref that may not be set
 */
export type FrameRefHandle = FrameSender | null;
