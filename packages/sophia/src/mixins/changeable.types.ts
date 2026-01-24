/**
 * Type definitions for the Changeable mixin pattern.
 *
 * These types provide type-safe alternatives to the legacy `any` types
 * used in the Changeable mixin. Use `createTypedChange` to get a properly
 * typed change function for your component.
 *
 * @example
 * import {createTypedChange} from "@ethosengine/sophia";
 * import type {ChangeFn, ChangeableProps} from "@ethosengine/sophia";
 * import type {DefinitionWidgetOptions} from "@ethosengine/perseus-core";
 *
 * type Props = ChangeableProps<DefinitionWidgetOptions>;
 *
 * class MyEditor extends React.Component<Props> {
 *     change: ChangeFn<DefinitionWidgetOptions> = createTypedChange(this);
 * }
 */

/**
 * Type for the change function that Changeable provides.
 *
 * Supports three calling conventions:
 * 1. Property name returns setter: `this.change("propName")` returns `(value) => void`
 * 2. Object of changes: `this.change({prop1: value1, prop2: value2})`
 * 3. Property name with value: `this.change("propName", value, callback)`
 */
export interface ChangeFn<TProps extends object> {
    /**
     * Overload 1: Property name returns a setter function
     * @example this.change("togglePrompt")("new value")
     */
    <K extends keyof TProps>(propName: K): (value: TProps[K]) => void;

    /**
     * Overload 2: Object of changes with optional callback
     * @example this.change({togglePrompt: "new", static: true}, callback)
     */
    (
        changes: Partial<TProps>,
        callback?: (() => void) | null,
        silent?: boolean,
    ): void;

    /**
     * Overload 3: Property name with value and optional callback
     * @example this.change("togglePrompt", "new value", callback)
     */
    <K extends keyof TProps>(
        propName: K,
        value: TProps[K],
        callback?: (() => void) | null,
    ): void;
}

/**
 * Props that Changeable adds to components.
 *
 * Components using the Changeable mixin must receive an `onChange` prop
 * that accepts partial updates to the widget options.
 *
 * NOTE: We use a looser type for onChange to maintain backwards compatibility
 * with existing code that passes various callback signatures. The type safety
 * primarily comes from the ChangeFn type on the change method itself.
 */
export interface ChangeableProps<TProps extends object> {
    /**
     * Callback invoked when any prop changes.
     * Receives the full props (merged with changes), not just the changes.
     *
     * The loose typing here is intentional for backwards compatibility.
     * Type safety is enforced via the ChangeFn type.
     */
    onChange: (
        values: Partial<TProps> | {[key: string]: unknown},
        callback?: (() => unknown) | null,
        silent?: boolean,
    ) => unknown;
}

/**
 * Interface for components using the Changeable mixin.
 *
 * This can be used to type refs or to document the expected shape
 * of components that use Changeable.
 */
export interface ChangeableComponent<TProps extends object> {
    change: ChangeFn<TProps>;
    props: TProps & ChangeableProps<TProps>;
}

/**
 * Helper type for widget editor props.
 *
 * Combines widget options with the standard editor props like onChange
 * and apiOptions.
 *
 * @example
 * type Props = EditorProps<DefinitionWidgetOptions>;
 */
export type EditorProps<TWidgetOptions extends object> = TWidgetOptions &
    ChangeableProps<TWidgetOptions> & {
        apiOptions?: {
            editingDisabled?: boolean;
            [key: string]: unknown;
        };
    };
