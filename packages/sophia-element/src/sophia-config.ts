/**
 * Sophia Configuration Singleton
 *
 * Provides a global configuration API for sophia-element.
 * Call Sophia.configure() once at app startup to set theme preferences.
 */

import {type LogLevel, LOG_PRIORITY} from "@ethosengine/sophia-core";

import {
    type SophiaColors,
    type SophiaTheme,
    type ThemeDetectionMode,
    type ThemeChangeCallback,
    LIGHT_COLORS,
    DARK_COLORS,
    getThemeWatcher,
    destroyThemeWatcher,
    _setThemeWatcherLogLevel,
} from "./theme";

/**
 * Configuration options for Sophia.configure().
 */
export interface SophiaConfig {
    /**
     * Theme mode.
     * - 'light': Always use light theme
     * - 'dark': Always use dark theme
     * - 'auto': Detect from system/class/attribute
     * @default 'auto'
     */
    theme?: "light" | "dark" | "auto";

    /**
     * How to detect theme when mode is 'auto'.
     * - 'system': Use prefers-color-scheme media query
     * - 'class': Watch for .dark/.light class on html/body
     * - 'attribute': Watch for data-theme attribute on html/body
     * @default 'system'
     */
    detectThemeFrom?: ThemeDetectionMode;

    /**
     * Custom color overrides for light theme.
     */
    colors?: Partial<SophiaColors>;

    /**
     * Custom color overrides for dark theme.
     */
    darkModeColors?: Partial<SophiaColors>;

    /**
     * Log level for debug output.
     * - 'none': No logging output
     * - 'error': Only errors (default)
     * - 'warn': Errors and warnings
     * - 'debug': All logging including debug info
     * @default 'error'
     */
    logLevel?: LogLevel;
}

/**
 * Internal configuration state.
 */
interface SophiaState {
    configured: boolean;
    themeMode: "light" | "dark" | "auto";
    detectionMode: ThemeDetectionMode;
    resolvedTheme: SophiaTheme;
    lightColors: SophiaColors;
    darkColors: SophiaColors;
    subscribers: Set<ThemeChangeCallback>;
    logLevel: LogLevel;
}

const state: SophiaState = {
    configured: false,
    themeMode: "auto",
    detectionMode: "system",
    resolvedTheme: "light",
    lightColors: LIGHT_COLORS,
    darkColors: DARK_COLORS,
    subscribers: new Set(),
    logLevel: "error",
};

// ─────────────────────────────────────────────────────────────────────────────
// Logger Utility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Centralized logger for Sophia.
 *
 * Respects the configured log level. Use instead of direct console calls.
 *
 * @example
 * ```typescript
 * import { logger } from '@ethosengine/sophia-element';
 *
 * logger.debug('Widget mounted', { widgetId: '123' });
 * logger.warn('Deprecated usage detected');
 * logger.error('Failed to load widget', error);
 * ```
 */
export const logger = {
    /**
     * Log debug information.
     * Only outputs when logLevel is 'debug'.
     */
    debug: (message: string, ...args: unknown[]): void => {
        if (LOG_PRIORITY[state.logLevel] >= LOG_PRIORITY.debug) {
            // eslint-disable-next-line no-console
            console.log("[sophia]", message, ...args);
        }
    },

    /**
     * Log warnings.
     * Outputs when logLevel is 'warn' or 'debug'.
     */
    warn: (message: string, ...args: unknown[]): void => {
        if (LOG_PRIORITY[state.logLevel] >= LOG_PRIORITY.warn) {
            // eslint-disable-next-line no-console
            console.warn("[sophia]", message, ...args);
        }
    },

    /**
     * Log errors.
     * Outputs when logLevel is 'error', 'warn', or 'debug'.
     */
    error: (message: string, ...args: unknown[]): void => {
        if (LOG_PRIORITY[state.logLevel] >= LOG_PRIORITY.error) {
            // eslint-disable-next-line no-console
            console.error("[sophia]", message, ...args);
        }
    },
};

/**
 * Notify all subscribers of a theme change.
 */
function notifySubscribers(): void {
    state.subscribers.forEach((callback) => {
        try {
            callback(state.resolvedTheme);
        } catch (e) {
            logger.error("Error in theme change callback:", e);
        }
    });
}

/**
 * Update the resolved theme based on current settings.
 */
function updateResolvedTheme(newTheme: SophiaTheme): void {
    if (newTheme !== state.resolvedTheme) {
        state.resolvedTheme = newTheme;
        notifySubscribers();
    }
}

/**
 * Sophia configuration API.
 *
 * @example
 * ```typescript
 * import { Sophia } from '@ethosengine/sophia-element';
 *
 * // Configure once at app startup
 * Sophia.configure({
 *   theme: 'auto',
 *   detectThemeFrom: 'class',
 *   colors: { primary: '#673ab7' }
 * });
 *
 * // Get current theme
 * const theme = Sophia.getTheme(); // 'light' or 'dark'
 *
 * // Subscribe to theme changes
 * const unsubscribe = Sophia.onThemeChange((theme) => {
 *   console.log('Theme changed to:', theme);
 * });
 * ```
 */
export const Sophia = {
    /**
     * Configure Sophia element theme and behavior.
     * Should be called once at application startup.
     *
     * @param config - Configuration options
     */
    configure(config: SophiaConfig = {}): void {
        // Set logLevel first so logger works for subsequent warnings
        state.logLevel = config.logLevel ?? "error";
        _setThemeWatcherLogLevel(state.logLevel);

        if (state.configured) {
            logger.warn(
                "Sophia.configure() has already been called. " +
                    "Configuration should only be set once at app startup.",
            );
        }

        // Update configuration state
        state.themeMode = config.theme ?? "auto";
        state.detectionMode = config.detectThemeFrom ?? "system";

        // Build color palettes with overrides
        state.lightColors = config.colors
            ? {...LIGHT_COLORS, ...config.colors}
            : LIGHT_COLORS;

        state.darkColors = config.darkModeColors
            ? {...DARK_COLORS, ...config.darkModeColors}
            : DARK_COLORS;

        // Set up theme detection
        if (state.themeMode === "auto") {
            const watcher = getThemeWatcher(state.detectionMode);
            state.resolvedTheme = watcher.getTheme();

            watcher.subscribe((theme) => {
                updateResolvedTheme(theme);
            });
        } else {
            // Fixed theme mode
            state.resolvedTheme = state.themeMode;
            destroyThemeWatcher();
        }

        state.configured = true;

        // eslint-disable-next-line testing-library/no-debugging-utils -- This is a custom logger, not testing-library debug
        logger.debug("Sophia configured", {
            theme: state.themeMode,
            detection: state.detectionMode,
            resolved: state.resolvedTheme,
            logLevel: state.logLevel,
        });
    },

    /**
     * Get the currently resolved theme.
     * Returns 'light' by default if not configured.
     */
    getTheme(): SophiaTheme {
        return state.resolvedTheme;
    },

    /**
     * Get the color palette for the current theme.
     */
    getColors(): SophiaColors {
        return state.resolvedTheme === "dark"
            ? state.darkColors
            : state.lightColors;
    },

    /**
     * Get colors for a specific theme.
     */
    getColorsForTheme(theme: SophiaTheme): SophiaColors {
        return theme === "dark" ? state.darkColors : state.lightColors;
    },

    /**
     * Subscribe to theme changes.
     * Returns an unsubscribe function.
     *
     * @param callback - Function called when theme changes
     * @returns Unsubscribe function
     */
    onThemeChange(callback: ThemeChangeCallback): () => void {
        state.subscribers.add(callback);
        return () => {
            state.subscribers.delete(callback);
        };
    },

    /**
     * Check if Sophia has been configured.
     */
    isConfigured(): boolean {
        return state.configured;
    },

    /**
     * Get the current configuration (for debugging).
     */
    getConfig(): Readonly<{
        themeMode: "light" | "dark" | "auto";
        detectionMode: ThemeDetectionMode;
        resolvedTheme: SophiaTheme;
        logLevel: LogLevel;
    }> {
        return {
            themeMode: state.themeMode,
            detectionMode: state.detectionMode,
            resolvedTheme: state.resolvedTheme,
            logLevel: state.logLevel,
        };
    },

    /**
     * Get the current log level.
     */
    getLogLevel(): LogLevel {
        return state.logLevel;
    },

    /**
     * Set the log level dynamically (without full reconfiguration).
     */
    setLogLevel(level: LogLevel): void {
        state.logLevel = level;
        _setThemeWatcherLogLevel(level);
        // eslint-disable-next-line testing-library/no-debugging-utils -- This is a custom logger, not testing-library debug
        logger.debug("Log level changed to:", level);
    },

    /**
     * Reset configuration (for testing).
     * @internal
     */
    _reset(): void {
        state.configured = false;
        state.themeMode = "auto";
        state.detectionMode = "system";
        state.resolvedTheme = "light";
        state.lightColors = LIGHT_COLORS;
        state.darkColors = DARK_COLORS;
        state.subscribers.clear();
        state.logLevel = "error";
        _setThemeWatcherLogLevel("error");
        destroyThemeWatcher();
    },
};
