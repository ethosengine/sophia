/**
 * Psephos — Governance ballot rendering types
 *
 * The third Sophia pillar: Perseus renders exercises,
 * Psyche measures understanding, Psephos renders formal ballots.
 */

/** Supported voting mechanisms */
export type VotingMechanism =
    | "ranked-choice"
    | "approval"
    | "score-vote"
    | "dot-vote"
    | "consent";

/** A formal ballot artifact rendered by Psephos */
export interface PsephosBallot {
    id: string;
    purpose: "governance";
    proposal: PsephosProposal;
    options: ReadonlyArray<PsephosOption>;
    mechanism: VotingMechanism;
    config: PsephosConfig;
    hygiene: ElectionHygiene;
    previousBallot?: string;
}

/** The proposal being voted on */
export interface PsephosProposal {
    id: string;
    title: string;
    description: string;
    proposalType: string;
}

/** A single option on a ballot */
export interface PsephosOption {
    id: string;
    label: string;
    description: string;
    position: number;
    source?: string;
    sourceJustification?: string;
}

/** Mechanism-specific configuration */
export interface PsephosConfig {
    scoreMin?: number;
    scoreMax?: number;
    dotsPerVoter?: number;
    quorumPercentage?: number;
    passageThreshold?: number;
}

/**
 * Election hygiene — structural fairness built into the renderer.
 *
 * These are not optional UX preferences. They are anti-capture measures
 * that prevent ballot design from influencing outcomes.
 */
export interface ElectionHygiene {
    randomizeOrder: boolean;
    randomSeed?: string;
    equalVisualWeight: boolean;
    requireReasoning: boolean;
    reasoningMinLength?: number;
    showResultsAfterVote: boolean;
    confirmBeforeSubmit: boolean;
    hideVoterCount: boolean;
}

/** Per-mechanism hygiene defaults */
export const DEFAULT_HYGIENE: Record<VotingMechanism, ElectionHygiene> = {
    "ranked-choice": {
        randomizeOrder: true,
        equalVisualWeight: true,
        requireReasoning: false,
        showResultsAfterVote: true,
        confirmBeforeSubmit: true,
        hideVoterCount: true,
    },
    approval: {
        randomizeOrder: true,
        equalVisualWeight: true,
        requireReasoning: false,
        showResultsAfterVote: true,
        confirmBeforeSubmit: false,
        hideVoterCount: true,
    },
    "score-vote": {
        randomizeOrder: true,
        equalVisualWeight: true,
        requireReasoning: false,
        showResultsAfterVote: true,
        confirmBeforeSubmit: true,
        hideVoterCount: false,
    },
    "dot-vote": {
        randomizeOrder: true,
        equalVisualWeight: true,
        requireReasoning: false,
        showResultsAfterVote: true,
        confirmBeforeSubmit: true,
        hideVoterCount: false,
    },
    consent: {
        randomizeOrder: false,
        equalVisualWeight: true,
        requireReasoning: false,
        reasoningMinLength: 50,
        showResultsAfterVote: true,
        confirmBeforeSubmit: true,
        hideVoterCount: true,
    },
};

/** Per-option input state */
export interface OptionInput {
    rank?: number;
    score?: number;
    dots?: number;
    approved?: boolean;
}

/** Internal user input state tracked by ballot widgets */
export interface BallotUserInput {
    [optionId: string]: OptionInput | string | undefined;
    reasoning?: string;
}
