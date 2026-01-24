/**
 * Typed factory functions for the Changeable mixin.
 *
 * These functions provide type-safe wrappers around the legacy Changeable
 * mixin, allowing widget editors to have proper type checking without
 * requiring a full refactor of the mixin pattern.
 *
 * @example
 * import {createTypedChange} from "@ethosengine/sophia";
 * import type {ChangeFn, ChangeableProps} from "@ethosengine/sophia";
 * import type {DefinitionWidgetOptions} from "@ethosengine/perseus-core";
 *
 * type Props = ChangeableProps<DefinitionWidgetOptions>;
 *
 * class DefinitionEditor extends React.Component<Props> {
 *     change: ChangeFn<DefinitionWidgetOptions> = createTypedChange(this);
 *
 *     render() {
 *         return (
 *             <input onChange={this.change("togglePrompt")} />
 *         );
 *     }
 * }
 */

import * as Changeable from "./changeable";

import type {ChangeFn, ChangeableProps} from "./changeable.types";
import type * as React from "react";

/**
 * Create a properly typed change function for a component.
 *
 * This wraps the legacy Changeable.change function with proper TypeScript
 * types, providing type safety for property names and values.
 *
 * @param component - The React component instance (usually `this`)
 * @returns A typed change function bound to the component
 *
 * @example
 * class MyEditor extends React.Component<MyProps> {
 *     change = createTypedChange<MyWidgetOptions>(this);
 *
 *     render() {
 *         return (
 *             <input
 *                 value={this.props.togglePrompt}
 *                 // Type-safe: TypeScript knows this returns (value: string) => void
 *                 onChange={this.change("togglePrompt")}
 *             />
 *         );
 *     }
 * }
 */
export function createTypedChange<TOptions extends object>(
    component: React.Component<ChangeableProps<TOptions>>,
): ChangeFn<TOptions> {
    // We use a type assertion here because the underlying Changeable.change
    // function uses `any` types, but we're providing a strongly-typed wrapper.
    return ((...args: unknown[]) => {
        return Changeable.change.apply(component, args);
    }) as ChangeFn<TOptions>;
}

/**
 * Create a helper function for changing nested properties.
 *
 * Some widget editors have deeply nested options (like `graph.range`).
 * This helper makes it easier to update just part of a nested object
 * while preserving the rest.
 *
 * @param component - The React component instance (usually `this`)
 * @returns A function that updates a nested property
 *
 * @example
 * class GraphEditor extends React.Component<Props> {
 *     change = createTypedChange<GraphOptions>(this);
 *     changeNested = createNestedChange<GraphOptions>(this);
 *
 *     handleRangeChange = (newRange) => {
 *         // Instead of:
 *         // this.change({graph: {...this.props.graph, range: newRange}});
 *         //
 *         // Use:
 *         this.changeNested("graph", {range: newRange});
 *     };
 * }
 */
export function createNestedChange<TOptions extends object>(
    component: React.Component<ChangeableProps<TOptions>>,
): <K extends keyof TOptions>(
    key: K,
    nestedChanges: TOptions[K] extends object ? Partial<TOptions[K]> : never,
) => void {
    return <K extends keyof TOptions>(
        key: K,
        nestedChanges: TOptions[K] extends object
            ? Partial<TOptions[K]>
            : never,
    ) => {
        const current = (component.props as TOptions)[key];
        const merged =
            typeof current === "object" && current !== null
                ? {...current, ...nestedChanges}
                : nestedChanges;

        Changeable.change.call(component, {[key]: merged});
    };
}

/**
 * Create a typed change function that respects editingDisabled.
 *
 * Some editors need to check apiOptions.editingDisabled before allowing
 * changes. This factory handles that check automatically.
 *
 * @param component - The React component instance
 * @param getEditingDisabled - Function to check if editing is disabled
 * @returns A change function that no-ops when editing is disabled
 */
export function createGuardedChange<TOptions extends object>(
    component: React.Component<
        ChangeableProps<TOptions> & {
            apiOptions?: {editingDisabled?: boolean};
        }
    >,
    getEditingDisabled?: () => boolean,
): ChangeFn<TOptions> {
    const typedChange = createTypedChange<TOptions>(component);

    return ((...args: unknown[]) => {
        // Check if editing is disabled
        const disabled = getEditingDisabled
            ? getEditingDisabled()
            : (
                  component.props as {
                      apiOptions?: {editingDisabled?: boolean};
                  }
              ).apiOptions?.editingDisabled;

        if (disabled) {
            return;
        }

        return (typedChange as (...args: unknown[]) => unknown)(...args);
    }) as ChangeFn<TOptions>;
}
