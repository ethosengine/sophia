/**
 * Style Injection for Shadow DOM
 *
 * Handles injecting CSS into Shadow DOM with theme-aware
 * custom properties and Perseus style overrides.
 */

import type {SophiaColors} from "./palettes";

/**
 * Generate CSS custom properties from a color palette.
 */
export function generateColorProperties(colors: SophiaColors): string {
    return `
:host {
    /* Primary colors */
    --sophia-primary-color: ${colors.primary};
    --sophia-primary-hover: ${colors.primaryHover};
    --sophia-primary-active: ${colors.primaryActive};

    /* Background colors */
    --sophia-bg-color: ${colors.background};
    --sophia-bg-secondary: ${colors.backgroundSecondary};
    --sophia-surface-color: ${colors.surface};

    /* Text colors */
    --sophia-text-color: ${colors.text};
    --sophia-text-secondary: ${colors.textSecondary};
    --sophia-text-tertiary: ${colors.textTertiary};

    /* Border colors */
    --sophia-border-color: ${colors.border};
    --sophia-border-focus: ${colors.borderFocus};

    /* Feedback colors */
    --sophia-success: ${colors.success};
    --sophia-success-bg: ${colors.successBackground};
    --sophia-error: ${colors.error};
    --sophia-error-bg: ${colors.errorBackground};
    --sophia-warning: ${colors.warning};
    --sophia-warning-bg: ${colors.warningBackground};

    /* Interactive states */
    --sophia-hover-overlay: ${colors.hoverOverlay};
    --sophia-active-overlay: ${colors.activeOverlay};
    --sophia-disabled-bg: ${colors.disabledBackground};
    --sophia-disabled-text: ${colors.disabledText};

    /* Widget-specific */
    --sophia-input-bg: ${colors.inputBackground};
    --sophia-input-border: ${colors.inputBorder};
    --sophia-input-focus: ${colors.inputFocus};
    --sophia-selection-bg: ${colors.selectionBackground};
    --sophia-correct-highlight: ${colors.correctHighlight};
    --sophia-incorrect-highlight: ${colors.incorrectHighlight};
}
`.trim();
}

/**
 * Perseus/Sophia widget style overrides.
 * These remap Perseus styles to use Sophia CSS custom properties.
 */
export const PERSEUS_STYLE_OVERRIDES = `
/* Perseus widget overrides to use Sophia theme */

/* Container styles */
.perseus-renderer {
    color: var(--sophia-text-color);
}

/* Links */
.perseus-renderer a {
    color: var(--sophia-primary-color);
}

.perseus-renderer a:hover {
    color: var(--sophia-primary-hover);
}

/* Input fields */
.perseus-renderer input[type="text"],
.perseus-renderer input[type="number"],
.perseus-renderer textarea {
    background-color: var(--sophia-input-bg);
    border-color: var(--sophia-input-border);
    color: var(--sophia-text-color);
}

.perseus-renderer input:focus,
.perseus-renderer textarea:focus {
    border-color: var(--sophia-input-focus);
    outline-color: var(--sophia-input-focus);
}

/* Buttons */
.perseus-renderer button {
    background-color: var(--sophia-primary-color);
    color: white;
}

.perseus-renderer button:hover {
    background-color: var(--sophia-primary-hover);
}

.perseus-renderer button:active {
    background-color: var(--sophia-primary-active);
}

.perseus-renderer button:disabled {
    background-color: var(--sophia-disabled-bg);
    color: var(--sophia-disabled-text);
}

/* Radio and checkbox widgets */
.perseus-widget-radio .choice-icon {
    border-color: var(--sophia-input-border);
}

.perseus-widget-radio .choice-icon.checked {
    background-color: var(--sophia-primary-color);
    border-color: var(--sophia-primary-color);
}

.perseus-widget-radio .choice-selected {
    background-color: var(--sophia-selection-bg);
}

/* Correct/incorrect feedback */
.perseus-widget-radio .choice-correct,
.perseus-correct {
    background-color: var(--sophia-correct-highlight);
}

.perseus-widget-radio .choice-incorrect,
.perseus-incorrect {
    background-color: var(--sophia-incorrect-highlight);
}

/* Hints */
.perseus-hint {
    border-color: var(--sophia-border-color);
    background-color: var(--sophia-bg-secondary);
}

/* Math input */
.mq-math-mode {
    color: var(--sophia-text-color);
}

.mq-editable-field {
    background-color: var(--sophia-input-bg);
    border-color: var(--sophia-input-border);
}

.mq-editable-field.mq-focused {
    border-color: var(--sophia-input-focus);
}

/* Interactive graphs */
.interactive-graph-background {
    fill: var(--sophia-bg-secondary);
}

.interactive-graph-axis {
    stroke: var(--sophia-border-color);
}

/* Tables and matrices */
.perseus-widget-table table,
.perseus-widget-matrix table {
    border-color: var(--sophia-border-color);
}

.perseus-widget-table td,
.perseus-widget-matrix td {
    border-color: var(--sophia-border-color);
}

/* Expression widget */
.expression-input {
    border-color: var(--sophia-input-border);
    background-color: var(--sophia-input-bg);
}

.expression-input:focus-within {
    border-color: var(--sophia-input-focus);
}

/* Radio widget fixes */
/* Hide duplicate "Choose X answer:" - keep only sr-only legend */
.perseus-widget-radio-fieldset .instructions {
    display: none;
}

/* Make radio buttons clickable and styled properly */
.perseus-widget-radio button {
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: inherit;
    padding: 0;
}

.perseus-widget-radio button:hover {
    background-color: var(--sophia-hover-overlay, rgba(0, 0, 0, 0.04));
}

/* Radio option container */
.perseus-radio-option {
    margin-bottom: 8px;
    border-radius: 8px;
    transition: background-color 0.15s ease;
}

.perseus-radio-option:hover {
    background-color: var(--sophia-hover-overlay, rgba(0, 0, 0, 0.04));
}

/* Radio choice icon circle - using stable data attributes */
[data-sophia-choice-icon] {
    width: 24px;
    height: 24px;
    border: 2px solid var(--sophia-input-border, #5f6368);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    font-weight: 600;
    font-size: 12px;
    color: var(--sophia-text-secondary, #5f6368);
}

/* Selected choice icon styling */
[data-sophia-choice-icon][data-sophia-checked="true"] {
    background-color: var(--sophia-primary-color);
    border-color: var(--sophia-primary-color);
    color: white;
}

/* Inner wrapper for choice icon */
[data-sophia-choice-inner] {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Screen reader only text - keep hidden visually */
.perseus-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Fix text color in radio options - using structural selector */
.perseus-widget-radio .description {
    color: var(--sophia-text-color) !important;
}
`;

/**
 * Base element styles.
 * Imported from the CSS file during build.
 */
export const BASE_ELEMENT_STYLES = `
:host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    color: var(--sophia-text-color, #21242c);
    background-color: var(--sophia-bg-color, #ffffff);
}

:host([hidden]) {
    display: none;
}

.sophia-question-container {
    padding: var(--sophia-container-padding, 16px);
    border-radius: var(--sophia-border-radius, 8px);
}

.sophia-question-container.loading {
    opacity: 0.7;
    pointer-events: none;
}

.sophia-question-container.review-mode {
    pointer-events: none;
}

.sophia-error {
    padding: 16px;
    border: 1px solid var(--sophia-error-bg, #d93025);
    border-radius: 8px;
    background-color: var(--sophia-error-bg, #fce8e6);
    color: var(--sophia-error, #c5221f);
}

.sophia-error-title {
    font-weight: 600;
    margin-bottom: 8px;
}

.sophia-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--sophia-text-secondary, #5f6368);
}

.sophia-loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--sophia-border-color, #e8eaed);
    border-top-color: var(--sophia-primary-color, #1a73e8);
    border-radius: 50%;
    animation: sophia-spin 1s linear infinite;
}

@keyframes sophia-spin {
    to {
        transform: rotate(360deg);
    }
}
`;

/**
 * Create a complete stylesheet for the Shadow DOM.
 */
export function createShadowStylesheet(
    colors: SophiaColors,
    additionalStyles?: string,
): string {
    const parts = [
        generateColorProperties(colors),
        BASE_ELEMENT_STYLES,
        PERSEUS_STYLE_OVERRIDES,
    ];

    if (additionalStyles) {
        parts.push(additionalStyles);
    }

    return parts.join("\n\n");
}

/**
 * Inject styles into a Shadow DOM root.
 */
export function injectStyles(
    shadowRoot: ShadowRoot,
    colors: SophiaColors,
    additionalStyles?: string,
): HTMLStyleElement {
    const stylesheet = createShadowStylesheet(colors, additionalStyles);
    const styleElement = document.createElement("style");
    styleElement.textContent = stylesheet;
    shadowRoot.appendChild(styleElement);
    return styleElement;
}

/**
 * Update the color properties in an existing style element.
 */
export function updateStyleColors(
    styleElement: HTMLStyleElement,
    colors: SophiaColors,
    additionalStyles?: string,
): void {
    styleElement.textContent = createShadowStylesheet(colors, additionalStyles);
}
