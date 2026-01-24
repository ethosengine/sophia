import type {PerseusWidgetOptions, Version} from "../data-schema";
import type {Alignment} from "../types";

export type WidgetOptionsUpgradeMap = {
    // OldProps => NewProps,
    [targetMajorVersion: string]: (
        arg1: Record<string, unknown>,
    ) => Record<string, unknown>;
};

/**
 * A function that transforms widget options into their public form
 * (with answer data / rubrics removed).
 *
 * Note: This is now a generic type instead of a union of specific widget
 * util types to avoid circular dependencies. Each widget's
 * getPublicWidgetOptions function should satisfy this interface.
 */
export type PublicWidgetOptionsFunction<
    TInput = PerseusWidgetOptions,
    TOutput = unknown,
> = (options: TInput) => TOutput;

/**
 * Callback function used to traverse nested renderers within widget options.
 * Used for operations like tree traversal when processing widget content.
 */
export type TraverseRendererCallback = (renderer: unknown) => unknown;

/**
 * Generic widget logic interface with proper typing for defaultWidgetOptions.
 *
 * @template TOptions - The specific type for this widget's default options.
 *                      Defaults to Record<string, unknown> for backwards compatibility.
 */
export type WidgetLogic<
    TOptions extends Record<string, unknown> = Record<string, unknown>,
> = {
    name: string;
    version?: Version;
    /** Default options for the widget. May be partial since some fields have implicit defaults. */
    defaultWidgetOptions?: TOptions;
    supportedAlignments?: ReadonlyArray<Alignment>;
    defaultAlignment?: Alignment;
    accessible?: boolean | ((options: PerseusWidgetOptions) => boolean);
    /**
     * Traverses child widgets within the widget's options.
     * Used for operations like tree traversal when processing widget content.
     * The props parameter accepts any widget options (including deprecated widgets with object type).
     */
    traverseChildWidgets?: (
        props: PerseusWidgetOptions | object,
        traverseRenderer: TraverseRendererCallback,
    ) => PerseusWidgetOptions | object;

    /**
     * A function that provides a public version of the widget options that can
     * be shared with the client.
     */
    getPublicWidgetOptions?: PublicWidgetOptionsFunction;
};

/**
 * Widget logic with required defaultWidgetOptions.
 * Use this type for widgets that always provide default options.
 *
 * @template TOptions - The specific type for this widget's default options.
 */
export type WidgetLogicWithDefaults<TOptions extends Record<string, unknown>> =
    Omit<WidgetLogic<TOptions>, "defaultWidgetOptions"> & {
        /** Default options for the widget (required). */
        defaultWidgetOptions: TOptions;
    };
