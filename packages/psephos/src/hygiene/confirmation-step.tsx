import * as React from "react";

import type {
    PsephosBallot,
    BallotUserInput,
    OptionInput,
    PsephosOption,
} from "../types";

export interface ConfirmationStepProps {
    ballot: PsephosBallot;
    userInput: BallotUserInput;
    onConfirm: () => void;
    onGoBack: () => void;
}

/**
 * Confirmation interstitial — shown after submit, before firing onRecognition.
 *
 * Displays a mechanism-specific summary of the user's selections so the voter
 * can review before final submission. This is an election hygiene measure:
 * voters should see exactly what they're submitting.
 */
export function ConfirmationStep(
    props: ConfirmationStepProps,
): React.ReactElement {
    const {ballot, userInput, onConfirm, onGoBack} = props;

    const summary = buildSummary(ballot, userInput);
    const reasoning = userInput.reasoning as string | undefined;

    return (
        <div className="psephos-confirmation">
            <h2>Review your ballot</h2>

            <p className="psephos-confirmation-summary">{summary}</p>

            {reasoning && (
                <div className="psephos-confirmation-reasoning">
                    <strong>Your reasoning:</strong>
                    <p>{reasoning}</p>
                </div>
            )}

            <div className="psephos-confirmation-actions">
                <button
                    type="button"
                    className="psephos-confirm-btn"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
                <button
                    type="button"
                    className="psephos-goback-btn"
                    onClick={onGoBack}
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary builders
// ─────────────────────────────────────────────────────────────────────────────

function buildSummary(
    ballot: PsephosBallot,
    userInput: BallotUserInput,
): string {
    switch (ballot.mechanism) {
        case "approval":
            return buildApprovalSummary(ballot.options, userInput);
        case "ranked-choice":
            return buildRankedChoiceSummary(ballot.options, userInput);
        case "score-vote":
            return buildScoreVoteSummary(ballot.options, userInput);
        case "dot-vote":
            return buildDotVoteSummary(ballot.options, userInput);
        case "consent":
            return buildConsentSummary(ballot.options, userInput);
    }
}

function buildApprovalSummary(
    options: ReadonlyArray<PsephosOption>,
    userInput: BallotUserInput,
): string {
    const approved = options.filter((opt) => {
        const input = userInput[opt.id] as OptionInput | undefined;
        return input?.approved === true;
    });
    if (approved.length === 0) {
        return "You approved no options";
    }
    return "You approved: " + approved.map((o) => o.label).join(", ");
}

function buildRankedChoiceSummary(
    options: ReadonlyArray<PsephosOption>,
    userInput: BallotUserInput,
): string {
    const ranked: Array<{label: string; rank: number}> = [];
    for (const opt of options) {
        const input = userInput[opt.id] as OptionInput | undefined;
        if (input?.rank != null) {
            ranked.push({label: opt.label, rank: input.rank});
        }
    }
    ranked.sort((a, b) => a.rank - b.rank);
    if (ranked.length === 0) {
        return "No ranking provided";
    }
    const items = ranked.map((r) => `${r.rank}. ${r.label}`).join(", ");
    return "Your ranking: " + items;
}

function buildScoreVoteSummary(
    options: ReadonlyArray<PsephosOption>,
    userInput: BallotUserInput,
): string {
    const scores: string[] = [];
    for (const opt of options) {
        const input = userInput[opt.id] as OptionInput | undefined;
        if (input?.score != null) {
            scores.push(`${opt.label} = ${input.score}`);
        }
    }
    if (scores.length === 0) {
        return "No scores provided";
    }
    return "Your scores: " + scores.join(", ");
}

function buildDotVoteSummary(
    options: ReadonlyArray<PsephosOption>,
    userInput: BallotUserInput,
): string {
    const dots: string[] = [];
    for (const opt of options) {
        const input = userInput[opt.id] as OptionInput | undefined;
        if (input?.dots != null && input.dots > 0) {
            dots.push(`${opt.label} = ${input.dots} dots`);
        }
    }
    if (dots.length === 0) {
        return "No dots allocated";
    }
    return "Your allocation: " + dots.join(", ");
}

function buildConsentSummary(
    options: ReadonlyArray<PsephosOption>,
    userInput: BallotUserInput,
): string {
    const proposalId = options[0]?.id ?? "";
    const input = userInput[proposalId] as OptionInput | undefined;
    if (input?.approved === true) {
        return "You chose to consent";
    }
    if (input?.approved === false) {
        return "You chose to block";
    }
    return "No choice made";
}
