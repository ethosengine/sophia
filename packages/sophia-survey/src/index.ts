/**
 * Sophia Survey
 *
 * Psychometric assessment that recognizes what resonates with learners.
 * There is no "correct" answer - only what calls to the learner.
 *
 * @packageDocumentation
 */

export {
    recognizeResonance,
    getPrimarySubscale,
    hasResonance,
} from "./recognize-resonance";

export {
    aggregateResonance,
    getSubscaleRankings,
    hasClearPrimary,
    mergeAggregatedResonance,
    createInsightMessage,
} from "./aggregate";

// Re-export useful types from sophia-core
export type {
    Moment,
    Recognition,
    ResonanceResult,
    AggregatedResonance,
    SubscaleMappings,
    ChoiceSubscaleMap,
    SubscaleContribution,
    UserInputMap,
} from "@ethosengine/sophia-core";

// Re-export factory functions from sophia-core
export {
    createDiscoveryMoment,
    createRecognition,
    isDiscoveryMoment,
} from "@ethosengine/sophia-core";
