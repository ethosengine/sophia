/**
 * Sophia Theme Palettes
 *
 * Color definitions for light and dark themes.
 * These colors are used to generate CSS custom properties.
 */

/**
 * Sophia color scheme definition.
 */
export interface SophiaColors {
    // Primary colors
    primary: string;
    primaryHover: string;
    primaryActive: string;

    // Background colors
    background: string;
    backgroundSecondary: string;
    surface: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;

    // Border colors
    border: string;
    borderFocus: string;

    // Feedback colors
    success: string;
    successBackground: string;
    error: string;
    errorBackground: string;
    warning: string;
    warningBackground: string;

    // Interactive states
    hoverOverlay: string;
    activeOverlay: string;
    disabledBackground: string;
    disabledText: string;

    // Widget-specific
    inputBackground: string;
    inputBorder: string;
    inputFocus: string;
    selectionBackground: string;
    correctHighlight: string;
    incorrectHighlight: string;
}

/**
 * Light theme color palette (default).
 */
export const LIGHT_COLORS: SophiaColors = {
    // Primary colors
    primary: "#1a73e8",
    primaryHover: "#1557b0",
    primaryActive: "#174ea6",

    // Background colors
    background: "#ffffff",
    backgroundSecondary: "#f8f9fa",
    surface: "#ffffff",

    // Text colors
    text: "#21242c",
    textSecondary: "#5f6368",
    textTertiary: "#80868b",

    // Border colors
    border: "#e8eaed",
    borderFocus: "#1a73e8",

    // Feedback colors
    success: "#188038",
    successBackground: "#e6f4ea",
    error: "#c5221f",
    errorBackground: "#fce8e6",
    warning: "#f9ab00",
    warningBackground: "#fef7e0",

    // Interactive states
    hoverOverlay: "rgba(0, 0, 0, 0.04)",
    activeOverlay: "rgba(0, 0, 0, 0.08)",
    disabledBackground: "#f1f3f4",
    disabledText: "#9aa0a6",

    // Widget-specific
    inputBackground: "#ffffff",
    inputBorder: "#dadce0",
    inputFocus: "#1a73e8",
    selectionBackground: "#e8f0fe",
    correctHighlight: "#ceead6",
    incorrectHighlight: "#fad2cf",
};

/**
 * Dark theme color palette.
 */
export const DARK_COLORS: SophiaColors = {
    // Primary colors
    primary: "#8ab4f8",
    primaryHover: "#aecbfa",
    primaryActive: "#669df6",

    // Background colors
    background: "#1f1f1f",
    backgroundSecondary: "#2d2d2d",
    surface: "#292929",

    // Text colors
    text: "#e8eaed",
    textSecondary: "#9aa0a6",
    textTertiary: "#80868b",

    // Border colors
    border: "#3c4043",
    borderFocus: "#8ab4f8",

    // Feedback colors
    success: "#81c995",
    successBackground: "#1b3626",
    error: "#f28b82",
    errorBackground: "#3c2322",
    warning: "#fdd663",
    warningBackground: "#3d3523",

    // Interactive states
    hoverOverlay: "rgba(255, 255, 255, 0.08)",
    activeOverlay: "rgba(255, 255, 255, 0.12)",
    disabledBackground: "#3c4043",
    disabledText: "#5f6368",

    // Widget-specific
    inputBackground: "#2d2d2d",
    inputBorder: "#5f6368",
    inputFocus: "#8ab4f8",
    selectionBackground: "#303849",
    correctHighlight: "#1b3626",
    incorrectHighlight: "#3c2322",
};

/**
 * Creates a merged color palette with overrides.
 */
export function createColorPalette(
    base: SophiaColors,
    overrides?: Partial<SophiaColors>,
): SophiaColors {
    if (!overrides) {
        return base;
    }
    return {...base, ...overrides};
}

/**
 * Get colors for a theme.
 */
export function getColorsForTheme(
    theme: "light" | "dark",
    lightOverrides?: Partial<SophiaColors>,
    darkOverrides?: Partial<SophiaColors>,
): SophiaColors {
    if (theme === "dark") {
        return createColorPalette(DARK_COLORS, darkOverrides);
    }
    return createColorPalette(LIGHT_COLORS, lightOverrides);
}
