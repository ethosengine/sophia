/**
 * Psephos Element
 *
 * Web Component distribution for the Psephos governance ballot renderer.
 * Provides the <psephos-ballot> custom element for use in any framework.
 *
 * @packageDocumentation
 */

// ─────────────────────────────────────────────────────────────────────────────
// Web Component
// ─────────────────────────────────────────────────────────────────────────────

export {PsephosBallotElement, default as PsephosBallot} from "./psephos-ballot";

export {
    registerPsephosElement,
    isPsephosElementRegistered,
    PSEPHOS_BALLOT_TAG,
} from "./register";

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports from psephos (types consumers need)
// ─────────────────────────────────────────────────────────────────────────────

export type {
    PsephosBallot as PsephosBallotData,
    PsephosOption,
    PsephosConfig,
    ElectionHygiene,
    VotingMechanism,
    PsephosRendererProps,
} from "@ethosengine/psephos";

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports from sophia-core (convenience)
// ─────────────────────────────────────────────────────────────────────────────

export type {
    Recognition,
    GovernanceResult,
    BallotEntry,
} from "@ethosengine/sophia-core";

export {hasGovernanceResult} from "@ethosengine/sophia-core";
