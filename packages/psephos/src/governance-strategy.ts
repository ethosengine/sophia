/**
 * Governance Scoring Strategy
 *
 * Implements the ScoringStrategy interface for governance ballot assessment.
 * Validates ballot completeness and produces Recognition objects with
 * GovernanceResult payloads.
 *
 * @packageDocumentation
 */

import type {PsephosBallot, BallotUserInput, OptionInput} from "./types";
import type {PerseusRenderer, UserInputMap} from "@ethosengine/perseus-core";
import type {
    ScoringStrategy,
    Moment,
    Recognition,
    BallotEntry,
    GovernanceResult,
} from "@ethosengine/sophia-core";

// ─────────────────────────────────────────────────────────────────────────────
// Ballot Entry Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build BallotEntry[] from a PsephosBallot and BallotUserInput.
 *
 * Returns one BallotEntry per option with only the relevant field
 * populated per mechanism:
 * - ranked-choice: entry.rank
 * - approval/consent: entry.approved
 * - score-vote: entry.score
 * - dot-vote: entry.dots
 */
export function buildBallotEntries(
    ballot: PsephosBallot,
    userInput: BallotUserInput,
): BallotEntry[] {
    return ballot.options.map((option) => {
        const input = userInput[option.id] as OptionInput | undefined;
        const entry: BallotEntry = {optionId: option.id};

        switch (ballot.mechanism) {
            case "ranked-choice":
                entry.rank = input?.rank ?? null;
                break;
            case "approval":
            case "consent":
                entry.approved = input?.approved ?? null;
                break;
            case "score-vote":
                entry.score = input?.score ?? null;
                break;
            case "dot-vote":
                entry.dots = input?.dots ?? null;
                break;
        }

        return entry;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty Option Detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns option IDs that haven't been voted on.
 *
 * Rules per mechanism:
 * - approval: at least 1 option must be approved; empty if none approved
 * - ranked-choice: at least 1 option must be ranked; empty if none ranked
 * - score-vote: ALL options must be scored; returns IDs of unscored options
 * - dot-vote: always valid (zero dots is intentional non-allocation)
 * - consent: must choose consent or block; empty if no choice made
 */
export function getEmptyOptionIds(
    ballot: PsephosBallot,
    userInput: BallotUserInput,
): string[] {
    const optionIds = ballot.options.map((o) => o.id);

    switch (ballot.mechanism) {
        case "approval": {
            const hasAnyApproved = optionIds.some((id) => {
                const input = userInput[id] as OptionInput | undefined;
                return input?.approved === true;
            });
            return hasAnyApproved ? [] : optionIds;
        }

        case "ranked-choice": {
            const hasAnyRanked = optionIds.some((id) => {
                const input = userInput[id] as OptionInput | undefined;
                return input?.rank != null;
            });
            return hasAnyRanked ? [] : optionIds;
        }

        case "score-vote": {
            return optionIds.filter((id) => {
                const input = userInput[id] as OptionInput | undefined;
                return input?.score == null;
            });
        }

        case "dot-vote": {
            // Zero dots is intentional non-allocation — always valid
            return [];
        }

        case "consent": {
            const hasAnyChoice = optionIds.some((id) => {
                const input = userInput[id] as OptionInput | undefined;
                return input?.approved != null;
            });
            return hasAnyChoice ? [] : optionIds;
        }

        default:
            return optionIds;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Governance Scoring Strategy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Governance Scoring Strategy
 *
 * Processes governance ballot responses to produce Recognition objects
 * with GovernanceResult payloads. Unlike mastery (right/wrong) or
 * discovery (resonance), governance recognizes the voter's choices
 * in a formal decision-making process.
 */
export const GovernanceScoringStrategy: ScoringStrategy = {
    id: "governance",
    name: "Governance Ballot",

    getEmptyWidgetIds(
        content: PerseusRenderer,
        userInput: UserInputMap,
        _locale: string,
    ): ReadonlyArray<string> {
        // Cast content to PsephosBallot — in governance mode, the content
        // IS a PsephosBallot, not a standard Perseus renderer
        const ballot = content as unknown as PsephosBallot;
        const ballotInput = userInput as unknown as BallotUserInput;

        return getEmptyOptionIds(ballot, ballotInput);
    },

    recognize(
        moment: Moment,
        userInput: UserInputMap,
        _locale: string,
    ): Recognition {
        const ballot = moment.content as unknown as PsephosBallot;
        const ballotInput = userInput as unknown as BallotUserInput;

        const entries = buildBallotEntries(ballot, ballotInput);

        const governance: GovernanceResult = {
            mechanism: ballot.mechanism,
            ballots: entries,
            reasoning:
                typeof ballotInput.reasoning === "string"
                    ? ballotInput.reasoning
                    : undefined,
            timestamp: new Date().toISOString(),
            proposalId: ballot.proposal.id,
        };

        return {
            momentId: moment.id,
            purpose: "governance",
            governance,
            userInput,
            timestamp: Date.now(),
        };
    },
};
