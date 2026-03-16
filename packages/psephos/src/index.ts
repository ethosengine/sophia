import {registerScoringStrategy} from "@ethosengine/sophia-core";

import {GovernanceScoringStrategy} from "./governance-strategy";

// Auto-register on import (same pattern as psyche-survey)
registerScoringStrategy(GovernanceScoringStrategy);

export {GovernanceScoringStrategy} from "./governance-strategy";
export {buildBallotEntries, getEmptyOptionIds} from "./governance-strategy";

// Types
export type {
    PsephosBallot,
    PsephosProposal,
    PsephosOption,
    PsephosConfig,
    ElectionHygiene,
    VotingMechanism,
    BallotUserInput,
    OptionInput,
} from "./types";
export {DEFAULT_HYGIENE} from "./types";

// Re-export governance types from sophia-core for convenience
export type {GovernanceResult, BallotEntry} from "@ethosengine/sophia-core";
export {hasGovernanceResult} from "@ethosengine/sophia-core";
