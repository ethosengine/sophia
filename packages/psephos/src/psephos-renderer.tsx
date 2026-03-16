/**
 * PsephosRenderer — Main governance ballot renderer
 *
 * Orchestrates widget rendering, submit validation, and Recognition emission.
 * Analogous to sophia-element's internal SophiaRenderer for assessment content.
 *
 * @packageDocumentation
 */

import {getScoringStrategy} from "@ethosengine/sophia-core";
import * as React from "react";

import {ConfirmationStep} from "./hygiene/confirmation-step";
import {randomizeOptions} from "./hygiene/randomize-options";
import {ApprovalWidget} from "./widgets/approval";
import {ConsentWidget} from "./widgets/consent";
import {DotVoteWidget} from "./widgets/dot-vote";
import {RankedChoiceWidget} from "./widgets/ranked-choice";
import {ScoreVoteWidget} from "./widgets/score-vote";

import type {BallotUserInput, PsephosBallot} from "./types";
import type {BallotEntry, Recognition} from "@ethosengine/sophia-core";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface PsephosRendererProps {
    ballot: PsephosBallot;
    onRecognition?: (recognition: Recognition) => void;
    onAnswerChange?: (hasAnswer: boolean) => void;
    reviewMode?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a previous BallotEntry[] into BallotUserInput for widget
 * initialState restoration.
 */
function toBallotUserInput(entries: BallotEntry[]): BallotUserInput {
    const state: BallotUserInput = {};
    for (const entry of entries) {
        state[entry.optionId] = {
            rank: entry.rank ?? undefined,
            score: entry.score ?? undefined,
            dots: entry.dots ?? undefined,
            approved: entry.approved ?? undefined,
        };
    }
    return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PsephosRenderer(
    props: PsephosRendererProps,
): React.ReactElement {
    const {ballot, onRecognition, onAnswerChange, reviewMode} = props;

    // Resolve the governance scoring strategy
    const strategy = React.useMemo(() => getScoringStrategy("governance"), []);

    // Randomize option order when hygiene requires it
    const displayOptions = React.useMemo(() => {
        if (ballot.hygiene.randomizeOrder) {
            return randomizeOptions(ballot.options, ballot.hygiene.randomSeed);
        }
        return [...ballot.options];
    }, [
        ballot.options,
        ballot.hygiene.randomizeOrder,
        ballot.hygiene.randomSeed,
    ]);

    // Convert previousBallot to initial widget state
    const initialState = React.useMemo(
        () =>
            ballot.previousBallot
                ? toBallotUserInput(ballot.previousBallot)
                : undefined,
        [ballot.previousBallot],
    );

    // Track current user input
    const [userInput, setUserInput] = React.useState<BallotUserInput>(
        () => initialState ?? {},
    );

    // Confirmation step state
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    // Compute empty widget IDs to determine ballot validity
    const emptyIds = React.useMemo(() => {
        if (!strategy) {
            return ballot.options.map((o) => o.id);
        }
        return strategy.getEmptyWidgetIds(
            ballot as any,
            userInput as any,
            "en",
        );
    }, [strategy, ballot, userInput]);

    const isComplete = emptyIds.length === 0;

    // Handle widget state changes
    const handleChange = React.useCallback(
        (state: BallotUserInput) => {
            setUserInput(state);
            onAnswerChange?.(true);
        },
        [onAnswerChange],
    );

    // Fire the actual recognition callback
    const fireRecognition = React.useCallback(() => {
        if (!strategy || !isComplete) {
            return;
        }

        const moment = {
            id: ballot.id,
            purpose: ballot.purpose as any,
            content: ballot as any,
        };

        const recognition = strategy.recognize(moment, userInput as any, "en");

        onRecognition?.(recognition);
    }, [strategy, isComplete, ballot, userInput, onRecognition]);

    // Handle submit — gate through confirmation step when hygiene requires it
    const handleSubmit = React.useCallback(() => {
        if (!strategy || !isComplete) {
            return;
        }

        if (ballot.hygiene.confirmBeforeSubmit) {
            setShowConfirmation(true);
        } else {
            fireRecognition();
        }
    }, [
        strategy,
        isComplete,
        ballot.hygiene.confirmBeforeSubmit,
        fireRecognition,
    ]);

    // Render the mechanism-specific widget
    const renderWidget = (): React.ReactElement => {
        switch (ballot.mechanism) {
            case "approval":
                return (
                    <ApprovalWidget
                        options={displayOptions as any}
                        hygiene={ballot.hygiene}
                        onChange={handleChange}
                        initialState={initialState}
                    />
                );
            case "ranked-choice":
                return (
                    <RankedChoiceWidget
                        options={displayOptions as any}
                        hygiene={ballot.hygiene}
                        onChange={handleChange}
                        initialState={initialState}
                    />
                );
            case "score-vote":
                return (
                    <ScoreVoteWidget
                        options={displayOptions as any}
                        hygiene={ballot.hygiene}
                        config={ballot.config}
                        onChange={handleChange}
                        initialState={initialState}
                    />
                );
            case "dot-vote":
                return (
                    <DotVoteWidget
                        options={displayOptions as any}
                        hygiene={ballot.hygiene}
                        config={ballot.config}
                        onChange={handleChange}
                        initialState={initialState}
                    />
                );
            case "consent":
                return (
                    <ConsentWidget
                        options={displayOptions as any}
                        hygiene={ballot.hygiene}
                        onChange={handleChange}
                        initialState={initialState}
                    />
                );
            default:
                return (
                    <div className="psephos-not-implemented">
                        Mechanism &apos;{ballot.mechanism}&apos; not yet
                        implemented.
                    </div>
                );
        }
    };

    if (showConfirmation) {
        return (
            <div className="psephos-renderer">
                <ConfirmationStep
                    ballot={ballot}
                    userInput={userInput}
                    onConfirm={() => {
                        setShowConfirmation(false);
                        fireRecognition();
                    }}
                    onGoBack={() => setShowConfirmation(false)}
                />
            </div>
        );
    }

    return (
        <div className="psephos-renderer">
            <h3 className="psephos-proposal-title">{ballot.proposal.title}</h3>
            <p className="psephos-proposal-description">
                {ballot.proposal.description}
            </p>

            {renderWidget()}

            {!reviewMode && (
                <button
                    className="psephos-submit"
                    aria-label="Submit ballot"
                    disabled={!isComplete}
                    onClick={handleSubmit}
                >
                    Submit Ballot
                </button>
            )}
        </div>
    );
}
