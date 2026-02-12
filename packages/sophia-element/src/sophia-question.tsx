/**
 * SophiaQuestionElement
 *
 * A Web Component that wraps the Sophia rendering engine.
 * Provides style encapsulation via Shadow DOM and easy integration
 * with any framework (Angular, Vue, vanilla JS).
 */

import {emptyWidgetsFunctional} from "@ethosengine/perseus-score";
import {
    ServerItemRenderer,
    DependenciesContext,
    PerseusI18nContextProvider,
    LoadingContext,
    init,
    Dependencies,
    mockStrings,
} from "@ethosengine/sophia";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

import {computeRecognition, userInputEqual} from "./recognition";
import {Sophia, logger} from "./sophia-config";
import {injectStyles, updateStyleColors} from "./theme";

import type {
    PerseusItem,
    UserInputMap,
    PerseusWidgetsMap,
} from "@ethosengine/perseus-core";
import type {PerseusDependencies, ILogger} from "@ethosengine/sophia";
import type {Moment, Recognition} from "@ethosengine/sophia-core";

// Default logger for standalone use - uses configurable logger
const defaultLogger: ILogger = {
    log: (message: string, extra?: Record<string, unknown> | null) => {
        // eslint-disable-next-line testing-library/no-debugging-utils -- This is a custom logger, not testing-library debug
        logger.debug(message, extra ?? "");
    },
    error: (
        message: string,
        kind: string,
        extra?: {
            cause?: Error | null;
            loggedMetadata?: Record<string, unknown> | null;
        } | null,
    ) => {
        logger.error(message, {kind, ...extra});
        if (extra?.cause) {
            logger.error("Cause:", extra.cause);
        }
    },
};

// Simple TeX component for standalone use (renders as-is)
const SimpleTex = ({children}: {children: React.ReactNode}) => {
    return <span className="sophia-tex">{children}</span>;
};

// Default dependencies for standalone sophia-element use
// These are minimal stubs that allow widgets to function without a full Perseus setup
const defaultPerseusDependencies: PerseusDependencies = {
    // JIPT (Just In Place Translation) - disabled
    JIPT: {
        useJIPT: false,
    },
    graphieMovablesJiptLabels: {
        addLabel: () => {},
    },
    svgImageJiptLabels: {
        addLabel: () => {},
    },
    rendererTranslationComponents: {
        addComponent: () => -1,
        removeComponentAtIndex: () => {},
    },

    // TeX rendering - simple pass-through
    TeX: SimpleTex,

    // URL handling
    staticUrl: (str) => str ?? "",

    // Request info for standalone mode
    InitialRequestUrl: {
        origin: typeof window !== "undefined" ? window.location.origin : "",
        host: typeof window !== "undefined" ? window.location.host : "",
        protocol:
            typeof window !== "undefined" ? window.location.protocol : "https:",
    },

    // Standalone mode settings
    isDevServer: false,
    kaLocale: "en",

    // Logging
    Log: defaultLogger,
};

// Initialize sophia widgets and dependencies on first import
let initialized = false;
function ensureInitialized() {
    if (!initialized) {
        // Set the global dependencies first (required by some widgets)
        Dependencies.setDependencies(defaultPerseusDependencies);
        // Then register all widgets
        init();
        initialized = true;
    }
}

/**
 * Assessment mode for the question.
 */
export type SophiaMode = "mastery" | "discovery" | "reflection";

/**
 * Props for the internal React renderer.
 */
interface RendererProps {
    item: PerseusItem;
    moment: Moment | null;
    reviewMode: boolean;
    hintsVisible: number;
    onRecognition: ((recognition: Recognition) => void) | null;
    onAnswerChange: ((hasAnswer: boolean) => void) | null;
    onRendered: () => void;
    rendererRef: React.MutableRefObject<any>;
    locale: string;
    initialUserInput?: UserInputMap | null;
}

/**
 * Check if the given user input constitutes a valid answer.
 * Reusable validation logic for both interaction and restore scenarios.
 */
function checkAnswerValidity(
    widgets: PerseusWidgetsMap | undefined,
    userInput: UserInputMap | null | undefined,
    locale: string,
): boolean {
    if (!widgets || !userInput) {
        return false;
    }
    const widgetIds = Object.keys(widgets);
    const emptyWidgetIds = emptyWidgetsFunctional(
        widgets,
        widgetIds,
        userInput,
        locale,
    );
    return emptyWidgetIds.length === 0;
}

/**
 * Internal React component that renders the question.
 */
function SophiaRenderer(props: RendererProps): React.ReactElement {
    const {
        item,
        moment,
        reviewMode,
        hintsVisible,
        onRendered,
        onAnswerChange,
        onRecognition,
        rendererRef,
        locale,
        initialUserInput,
    } = props;

    // Track last fired input to prevent duplicate callbacks
    const lastFiredInputRef = React.useRef<UserInputMap | null>(null);

    // Reset when moment changes
    React.useEffect(() => {
        lastFiredInputRef.current = null;
    }, [moment?.id]);

    // Emit onAnswerChange(true) when initialUserInput restores a valid answer
    React.useEffect(() => {
        if (initialUserInput && onAnswerChange) {
            const isValid = checkAnswerValidity(
                item?.question?.widgets,
                initialUserInput,
                locale,
            );
            if (isValid) {
                onAnswerChange(true);
            }
        }
        // Only run when initialUserInput changes (restore scenario)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUserInput]);

    // Default dependencies for standalone use
    const defaultDependencies = React.useMemo(
        () => ({
            analytics: {onAnalyticsEvent: async () => {}},
            generateUrl: (args: {path: string}) => args.path,
            useVideo: () => ({status: "loading" as const}),
        }),
        [],
    );

    // Use mockStrings which provides all required Perseus strings
    const strings = React.useMemo(() => mockStrings, []);

    // API options with interaction callback to detect answer changes
    const apiOptions = React.useMemo(
        () => ({
            interactionCallback: (updatedUserInput: UserInputMap) => {
                // Called when user interacts with any widget
                // Check if all required widgets have valid input before enabling continue
                if (item?.question?.widgets != null) {
                    const hasValidAnswer = checkAnswerValidity(
                        item.question.widgets,
                        updatedUserInput,
                        locale,
                    );

                    // Notify about answer state change
                    onAnswerChange?.(hasValidAnswer);

                    // Fire recognition callback when answer is complete
                    // but only if the input has actually changed and not in review mode
                    if (
                        hasValidAnswer &&
                        onRecognition &&
                        moment &&
                        !reviewMode
                    ) {
                        if (
                            !userInputEqual(
                                updatedUserInput,
                                lastFiredInputRef.current,
                            )
                        ) {
                            lastFiredInputRef.current = updatedUserInput;
                            const recognition = computeRecognition(
                                moment,
                                updatedUserInput,
                                locale,
                            );
                            onRecognition(recognition);
                        }
                    }
                }
            },
        }),
        [onAnswerChange, onRecognition, item, moment, locale, reviewMode],
    );

    // Primary: LoadingContext/ServerItemRenderer calls onRendered when assets load
    // Fallback: Ensure onRendered is called even if Perseus doesn't fire it
    const renderedRef = React.useRef(false);
    const handleRendered = React.useCallback(() => {
        if (!renderedRef.current) {
            renderedRef.current = true;
            onRendered();
        }
    }, [onRendered]);

    // Provide onRendered to LoadingContext for Perseus to call
    const loadingContextValueWithHandler = React.useMemo(
        () => ({
            onRendered: handleRendered,
        }),
        [handleRendered],
    );

    // Safety fallback: fire onRendered after mount if Perseus hasn't
    React.useEffect(() => {
        // Give Perseus a chance to call onRendered (e.g., after images load)
        // If it hasn't fired within 50ms, trigger it ourselves
        const timer = setTimeout(() => {
            handleRendered();
        }, 50);
        return () => clearTimeout(timer);
    }, [handleRendered]);

    return (
        <PerseusI18nContextProvider locale={locale} strings={strings}>
            <LoadingContext.Provider value={loadingContextValueWithHandler}>
                <DependenciesContext.Provider value={defaultDependencies}>
                    <ServerItemRenderer
                        ref={rendererRef}
                        item={item}
                        reviewMode={reviewMode}
                        hintsVisible={hintsVisible}
                        dependencies={defaultDependencies}
                        apiOptions={apiOptions}
                        initialUserInput={initialUserInput ?? undefined}
                    />
                </DependenciesContext.Provider>
            </LoadingContext.Provider>
        </PerseusI18nContextProvider>
    );
}

/**
 * <sophia-question> Web Component
 *
 * Renders assessment questions with Shadow DOM encapsulation.
 *
 * @example
 * ```html
 * <sophia-question id="q1"></sophia-question>
 * <script>
 *   const el = document.getElementById('q1');
 *   el.moment = {
 *     id: 'moment-1',
 *     purpose: 'mastery',
 *     content: { ... }
 *   };
 *   el.onRecognition = (recognition) => {
 *     console.log('Recognition:', recognition);
 *   };
 * </script>
 * ```
 */
export class SophiaQuestionElement extends HTMLElement {
    // Private state
    private _moment: Moment | null = null;
    private _mode: SophiaMode = "mastery";
    private _reviewMode: boolean = false;
    private _instrumentId: string | null = null;
    private _hintsVisible: number = 0;
    private _locale: string = "en";
    private _initialUserInput: UserInputMap | null = null;

    // Callbacks
    private _onRecognition: ((recognition: Recognition) => void) | null = null;
    private _onAnswerChange: ((hasAnswer: boolean) => void) | null = null;

    // React internals
    private shadowRoot_: ShadowRoot;
    private reactRoot: ReactDOM.Root | null = null;
    private rendererRef: React.MutableRefObject<any> = {current: null};
    private container: HTMLDivElement | null = null;
    private styleElement: HTMLStyleElement | null = null;
    private themeUnsubscribe: (() => void) | null = null;

    // State tracking
    private isRendered: boolean = false;
    private lastUserInput: UserInputMap = {};

    static get observedAttributes(): string[] {
        return ["mode", "review-mode", "instrument-id", "locale"];
    }

    constructor() {
        super();

        ensureInitialized();

        // Create Shadow DOM
        this.shadowRoot_ = this.attachShadow({mode: "open"});
    }

    connectedCallback(): void {
        // Ensure Sophia is configured (use defaults if not)
        if (!Sophia.isConfigured()) {
            Sophia.configure();
        }

        // Create container
        this.container = document.createElement("div");
        this.container.className = "sophia-question-container";

        // Inject styles with current theme
        const colors = Sophia.getColors();
        this.styleElement = injectStyles(this.shadowRoot_, colors);

        // Append container after styles
        this.shadowRoot_.appendChild(this.container);

        // Subscribe to theme changes
        this.themeUnsubscribe = Sophia.onThemeChange(() => {
            this.updateTheme();
        });

        // Create React root
        this.reactRoot = ReactDOM.createRoot(this.container);

        // Initial render
        this.render();
    }

    disconnectedCallback(): void {
        // Unsubscribe from theme changes
        if (this.themeUnsubscribe) {
            this.themeUnsubscribe();
            this.themeUnsubscribe = null;
        }

        // Unmount React
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        }

        // Clear container
        if (this.container) {
            this.container.remove();
            this.container = null;
        }

        this.styleElement = null;
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null,
    ): void {
        if (oldValue === newValue) {
            return;
        }

        switch (name) {
            case "mode":
                if (
                    newValue === "mastery" ||
                    newValue === "discovery" ||
                    newValue === "reflection"
                ) {
                    this._mode = newValue;
                }
                break;
            case "review-mode":
                this._reviewMode = newValue !== null && newValue !== "false";
                break;
            case "instrument-id":
                this._instrumentId = newValue;
                break;
            case "locale":
                this._locale = newValue ?? "en";
                break;
        }

        this.render();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public Properties
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * The Moment to render.
     */
    get moment(): Moment | null {
        return this._moment;
    }

    set moment(value: Moment | null) {
        this._moment = value;
        this.isRendered = false;
        this.lastUserInput = {};
        this.render();
    }

    /**
     * Assessment mode.
     */
    get mode(): SophiaMode {
        return this._mode;
    }

    set mode(value: SophiaMode) {
        this._mode = value;
        this.render();
    }

    /**
     * Whether to display in review mode (non-interactive).
     */
    get reviewMode(): boolean {
        return this._reviewMode;
    }

    set reviewMode(value: boolean) {
        this._reviewMode = value;
        this.render();
    }

    /**
     * Instrument ID for discovery mode.
     */
    get instrumentId(): string | null {
        return this._instrumentId;
    }

    set instrumentId(value: string | null) {
        this._instrumentId = value;
    }

    /**
     * Callback fired when a recognition is produced.
     */
    get onRecognition(): ((recognition: Recognition) => void) | null {
        return this._onRecognition;
    }

    set onRecognition(value: ((recognition: Recognition) => void) | null) {
        this._onRecognition = value;
    }

    /**
     * Callback fired when the answer state changes.
     */
    get onAnswerChange(): ((hasAnswer: boolean) => void) | null {
        return this._onAnswerChange;
    }

    set onAnswerChange(value: ((hasAnswer: boolean) => void) | null) {
        this._onAnswerChange = value;
    }

    /**
     * Initial user input to restore when rendering.
     * Used for survey-mode navigation where users can go back and review/edit answers.
     */
    get initialUserInput(): UserInputMap | null {
        return this._initialUserInput;
    }

    set initialUserInput(value: UserInputMap | null) {
        this._initialUserInput = value;
        this.render();
    }

    /**
     * Number of hints to show.
     */
    get hintsVisible(): number {
        return this._hintsVisible;
    }

    set hintsVisible(value: number) {
        this._hintsVisible = value;
        this.render();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the current Recognition result.
     * Scores the current user input and returns the result.
     */
    getRecognition(): Recognition | null {
        if (!this._moment || !this.rendererRef.current) {
            return null;
        }

        const userInput = this.rendererRef.current.getUserInput?.() ?? {};
        return computeRecognition(this._moment, userInput, this._locale);
    }

    /**
     * Focus the first input in the question.
     */
    focusInput(): void {
        this.rendererRef.current?.focus?.();
    }

    /**
     * Blur any focused input.
     */
    blur(): void {
        this.rendererRef.current?.blur?.();
    }

    /**
     * Get the current widget state for persistence.
     */
    getState(): unknown {
        return this.rendererRef.current?.getSerializedState?.() ?? null;
    }

    /**
     * Restore widget state from a previous getState() call.
     *
     * @remarks
     * Not yet implemented. Perseus doesn't expose a simple restoreState API.
     * Would need to be implemented via re-rendering with user input.
     */
    restoreState(_state: unknown): void {
        logger.warn("restoreState not yet implemented");
    }

    /**
     * Show the next hint (if available).
     */
    showNextHint(): void {
        if (
            this._moment?.hints &&
            this._hintsVisible < this._moment.hints.length
        ) {
            this._hintsVisible++;
            this.render();
        }
    }

    /**
     * Get the number of available hints.
     */
    getNumHints(): number {
        return this._moment?.hints?.length ?? 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────────────────

    private updateTheme(): void {
        if (this.styleElement) {
            const colors = Sophia.getColors();
            updateStyleColors(this.styleElement, colors);
        }
    }

    private handleRendered = (): void => {
        this.isRendered = true;
        // Directly remove loading class since render() won't be called again
        if (this.container) {
            this.container.classList.remove("loading");
        }
    };

    private render(): void {
        if (!this.reactRoot || !this.container) {
            return;
        }

        // Update container classes
        this.container.classList.toggle("loading", !this.isRendered);
        this.container.classList.toggle("review-mode", this._reviewMode);

        if (!this._moment) {
            // Render empty state
            this.reactRoot.render(
                <div className="sophia-empty">No question loaded</div>,
            );
            return;
        }

        // Convert Moment to PerseusItem format
        const item: PerseusItem = {
            question: this._moment.content,
            hints: this._moment.hints ?? [],
            answerArea: null,
            _multi: null,
            itemDataVersion: {major: 0, minor: 1},
        };

        // Key strategy: When restoring input, use a different key prefix to avoid
        // React remounting and losing the restored state. When not restoring,
        // use moment.id to force complete re-render when question changes.
        const shouldForceRemount = !this._initialUserInput;
        const momentKey = shouldForceRemount
            ? this._moment.id || `moment-${Date.now()}`
            : `restore-${this._moment.id}`;

        this.reactRoot.render(
            <SophiaRenderer
                key={momentKey}
                item={item}
                moment={this._moment}
                reviewMode={this._reviewMode}
                hintsVisible={this._hintsVisible}
                onRecognition={this._onRecognition}
                onAnswerChange={this._onAnswerChange}
                onRendered={this.handleRendered}
                rendererRef={this.rendererRef}
                locale={this._locale}
                initialUserInput={this._initialUserInput}
            />,
        );
    }
}

// Export for registration
export default SophiaQuestionElement;
