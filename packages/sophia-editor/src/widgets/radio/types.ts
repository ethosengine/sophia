/**
 * Interface for components that can be focused.
 * Used to expose focus() method up the component chain via forwardRef.
 */
export interface FocusableHandle {
    focus(): void;
}
