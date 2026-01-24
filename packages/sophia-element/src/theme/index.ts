/**
 * Theme Module
 *
 * Exports for the Sophia theming system.
 */

// Color palettes
export {
    LIGHT_COLORS,
    DARK_COLORS,
    createColorPalette,
    getColorsForTheme,
} from "./palettes";
export type {SophiaColors} from "./palettes";

// Theme watcher
export {
    ThemeWatcher,
    getThemeWatcher,
    destroyThemeWatcher,
    _setThemeWatcherLogLevel,
} from "./theme-watcher";
export type {
    SophiaTheme,
    ThemeDetectionMode,
    ThemeChangeCallback,
} from "./theme-watcher";

// Style injection
export {
    generateColorProperties,
    createShadowStylesheet,
    injectStyles,
    updateStyleColors,
    PERSEUS_STYLE_OVERRIDES,
    BASE_ELEMENT_STYLES,
} from "./inject-styles";
