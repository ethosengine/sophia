/**
 * Theme Watcher
 *
 * Automatically detects theme changes from various sources:
 * - System preference (prefers-color-scheme)
 * - CSS class on document (.dark, .light)
 * - Data attribute (data-theme="dark|light")
 */

import {type LogLevel, LOG_PRIORITY} from "@ethosengine/sophia-core";

// Internal logger that respects the global log level
// We can't import from sophia-config due to circular deps, so we access state directly
let _logLevel: LogLevel = "error";

export function _setThemeWatcherLogLevel(level: LogLevel): void {
    _logLevel = level;
}

const themeLogger = {
    error: (message: string, ...args: unknown[]): void => {
        if (LOG_PRIORITY[_logLevel] >= LOG_PRIORITY.error) {
            // eslint-disable-next-line no-console
            console.error("[sophia:theme]", message, ...args);
        }
    },
};

export type SophiaTheme = "light" | "dark";
export type ThemeDetectionMode = "system" | "class" | "attribute";

export type ThemeChangeCallback = (theme: SophiaTheme) => void;

/**
 * ThemeWatcher monitors for theme changes and notifies subscribers.
 */
export class ThemeWatcher {
    private mode: ThemeDetectionMode;
    private currentTheme: SophiaTheme;
    private callbacks: Set<ThemeChangeCallback> = new Set();
    private mediaQuery: MediaQueryList | null = null;
    private observer: MutationObserver | null = null;

    constructor(mode: ThemeDetectionMode = "system") {
        this.mode = mode;
        this.currentTheme = this.detectTheme();
        this.startWatching();
    }

    /**
     * Get the current resolved theme.
     */
    getTheme(): SophiaTheme {
        return this.currentTheme;
    }

    /**
     * Subscribe to theme changes.
     * Returns an unsubscribe function.
     */
    subscribe(callback: ThemeChangeCallback): () => void {
        this.callbacks.add(callback);
        return () => {
            this.callbacks.delete(callback);
        };
    }

    /**
     * Update the detection mode.
     */
    setMode(mode: ThemeDetectionMode): void {
        if (mode === this.mode) {
            return;
        }

        this.stopWatching();
        this.mode = mode;
        const newTheme = this.detectTheme();
        this.startWatching();

        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;
            this.notifySubscribers();
        }
    }

    /**
     * Force a specific theme (stops watching).
     */
    forceTheme(theme: SophiaTheme): void {
        this.stopWatching();
        if (theme !== this.currentTheme) {
            this.currentTheme = theme;
            this.notifySubscribers();
        }
    }

    /**
     * Stop watching and clean up.
     */
    destroy(): void {
        this.stopWatching();
        this.callbacks.clear();
    }

    private detectTheme(): SophiaTheme {
        switch (this.mode) {
            case "system":
                return this.detectFromSystem();
            case "class":
                return this.detectFromClass();
            case "attribute":
                return this.detectFromAttribute();
            default:
                return "light";
        }
    }

    private detectFromSystem(): SophiaTheme {
        if (typeof window === "undefined") {
            return "light";
        }
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        return prefersDark ? "dark" : "light";
    }

    private detectFromClass(): SophiaTheme {
        if (typeof document === "undefined") {
            return "light";
        }
        const html = document.documentElement;
        const body = document.body;

        // Check for .dark class
        if (
            html.classList.contains("dark") ||
            body?.classList.contains("dark")
        ) {
            return "dark";
        }

        // Check for .light class (explicit light mode)
        if (
            html.classList.contains("light") ||
            body?.classList.contains("light")
        ) {
            return "light";
        }

        // Fallback to system preference
        return this.detectFromSystem();
    }

    private detectFromAttribute(): SophiaTheme {
        if (typeof document === "undefined") {
            return "light";
        }
        const html = document.documentElement;
        const body = document.body;

        // Check data-theme attribute
        const htmlTheme = html.getAttribute("data-theme");
        const bodyTheme = body?.getAttribute("data-theme");

        if (htmlTheme === "dark" || bodyTheme === "dark") {
            return "dark";
        }

        if (htmlTheme === "light" || bodyTheme === "light") {
            return "light";
        }

        // Fallback to system preference
        return this.detectFromSystem();
    }

    private startWatching(): void {
        switch (this.mode) {
            case "system":
                this.watchSystem();
                break;
            case "class":
            case "attribute":
                this.watchDOM();
                break;
        }
    }

    private stopWatching(): void {
        if (this.mediaQuery) {
            this.mediaQuery.removeEventListener(
                "change",
                this.handleMediaChange,
            );
            this.mediaQuery = null;
        }

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    private watchSystem(): void {
        if (typeof window === "undefined") {
            return;
        }

        this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        this.mediaQuery.addEventListener("change", this.handleMediaChange);
    }

    private watchDOM(): void {
        if (typeof document === "undefined") {
            return;
        }

        this.observer = new MutationObserver(this.handleMutation);

        // Watch document.documentElement for class/attribute changes
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter:
                this.mode === "class" ? ["class"] : ["data-theme", "class"],
        });

        // Also watch body if it exists
        if (document.body != null) {
            this.observer.observe(document.body, {
                attributes: true,
                attributeFilter:
                    this.mode === "class" ? ["class"] : ["data-theme", "class"],
            });
        }
    }

    private handleMediaChange = (e: MediaQueryListEvent): void => {
        const newTheme: SophiaTheme = e.matches ? "dark" : "light";
        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;
            this.notifySubscribers();
        }
    };

    private handleMutation = (): void => {
        const newTheme = this.detectTheme();
        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;
            this.notifySubscribers();
        }
    };

    private notifySubscribers(): void {
        this.callbacks.forEach((callback) => {
            try {
                callback(this.currentTheme);
            } catch (e) {
                themeLogger.error("Error in theme change callback:", e);
            }
        });
    }
}

// Singleton instance for global theme watching
let globalWatcher: ThemeWatcher | null = null;

/**
 * Get or create the global theme watcher.
 */
export function getThemeWatcher(mode?: ThemeDetectionMode): ThemeWatcher {
    if (!globalWatcher) {
        globalWatcher = new ThemeWatcher(mode ?? "system");
    } else if (mode && mode !== globalWatcher["mode"]) {
        globalWatcher.setMode(mode);
    }
    return globalWatcher;
}

/**
 * Destroy the global theme watcher.
 */
export function destroyThemeWatcher(): void {
    if (globalWatcher) {
        globalWatcher.destroy();
        globalWatcher = null;
    }
}
