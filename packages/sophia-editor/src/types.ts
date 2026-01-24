/**
 * Mode-Aware Editor Types
 *
 * Types supporting multi-mode content editing for mastery, discovery, and reflection.
 */

import type {
    AssessmentPurpose,
    SubscaleMappings,
} from "@ethosengine/sophia-core";

/**
 * Props for mode-aware editor components.
 *
 * These props enable editors to adapt their UI based on assessment purpose:
 * - Mastery: Show correct answer config, hints integration
 * - Discovery: Show subscale mappings for radio/dropdown widgets
 * - Reflection: Hide all scoring/correctness UI
 */
export interface ModeAwareEditorProps {
    /** Current assessment purpose */
    purpose?: AssessmentPurpose;

    /** Callback when purpose changes */
    onPurposeChange?: (purpose: AssessmentPurpose) => void;

    /** Subscale mappings for discovery mode widgets */
    subscaleMappings?: SubscaleMappings;

    /** Callback when subscale mappings change */
    onSubscaleMappingsChange?: (mappings: SubscaleMappings) => void;

    /** Available subscale names for discovery mode (domain-specific) */
    subscaleNames?: string[];
}

/**
 * Predefined subscale sets from established psychometric frameworks.
 * Consumers can choose from these or provide their own via subscaleNames.
 */
export const PREDEFINED_SUBSCALE_SETS = {
    /** Big Five personality traits */
    bigFive: [
        "openness",
        "conscientiousness",
        "extraversion",
        "agreeableness",
        "neuroticism",
    ],

    /** Holland RIASEC career interests */
    hollandCodes: [
        "realistic",
        "investigative",
        "artistic",
        "social",
        "enterprising",
        "conventional",
    ],

    /** Learning styles (VARK) */
    learningStyles: ["visual", "auditory", "reading", "kinesthetic"],

    /** Elohim Protocol domains */
    elohimDomains: ["governance", "care", "economic"],
} as const;

export type PredefinedSubscaleSet = keyof typeof PREDEFINED_SUBSCALE_SETS;
