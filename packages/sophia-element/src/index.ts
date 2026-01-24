/**
 * Sophia Element
 *
 * Web Component distribution for the Sophia rendering engine.
 * Provides the <sophia-question> custom element for use in any framework.
 *
 * @packageDocumentation
 */

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

export {Sophia, logger} from "./sophia-config";
export type {SophiaConfig} from "./sophia-config";

// ─────────────────────────────────────────────────────────────────────────────
// Web Component
// ─────────────────────────────────────────────────────────────────────────────

export {
    SophiaQuestionElement,
    default as SophiaQuestion,
} from "./sophia-question";
export type {SophiaMode} from "./sophia-question";

export {
    registerSophiaElement,
    isSophiaElementRegistered,
    SOPHIA_QUESTION_TAG,
} from "./register";

// ─────────────────────────────────────────────────────────────────────────────
// Theme System
// ─────────────────────────────────────────────────────────────────────────────

export {
    LIGHT_COLORS,
    DARK_COLORS,
    createColorPalette,
    getColorsForTheme,
    ThemeWatcher,
    getThemeWatcher,
    destroyThemeWatcher,
} from "./theme";

export type {
    SophiaColors,
    SophiaTheme,
    ThemeDetectionMode,
    ThemeChangeCallback,
} from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports from sophia-core (convenience)
// ─────────────────────────────────────────────────────────────────────────────

// Core types
export type {
    Moment,
    MomentMetadata,
    Recognition,
    MasteryResult,
    ResonanceResult,
    AggregatedMastery,
    AggregatedResonance,
    AssessmentPurpose,
    SubscaleMappings,
    ChoiceSubscaleMap,
    SubscaleContribution,
    LogLevel,
} from "@ethosengine/sophia-core";

// Log level constants
export {LOG_PRIORITY} from "@ethosengine/sophia-core";

// Factory functions
export {
    createMoment,
    createMasteryMoment,
    createDiscoveryMoment,
    createRecognition,
} from "@ethosengine/sophia-core";

// Utility functions
export {
    isMasteryMoment,
    isDiscoveryMoment,
    hasDemonstrated,
    getPrimarySubscale,
} from "@ethosengine/sophia-core";

// Recognition computation utility
export {computeRecognition, userInputEqual} from "./recognition";

// Scoring strategy types and registry
export type {
    ScoringStrategy,
    WidgetScoringResult,
} from "@ethosengine/sophia-core";

export {
    registerScoringStrategy,
    getScoringStrategy,
    getDefaultScoringStrategy,
    setDefaultScoringStrategy,
    getRegisteredStrategyIds,
    hasStrategy,
    NoOpScoringStrategy,
    hasMasteryResult,
    hasResonanceResult,
} from "@ethosengine/sophia-core";

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports from perseus-core (types only)
// ─────────────────────────────────────────────────────────────────────────────

export type {
    PerseusRenderer,
    PerseusItem,
    Hint,
    UserInputMap,
} from "@ethosengine/perseus-core";
