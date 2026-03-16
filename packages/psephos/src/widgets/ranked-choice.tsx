import * as React from "react";

import type {
    PsephosOption,
    ElectionHygiene,
    BallotUserInput,
    OptionInput,
} from "../types";

export interface RankedChoiceWidgetProps {
    options: ReadonlyArray<PsephosOption>;
    hygiene: ElectionHygiene;
    onChange: (state: BallotUserInput) => void;
    initialState?: BallotUserInput;
}

/**
 * Ranked-choice voting widget.
 *
 * Two zones: "Ranked" (ordered) and "Not ranked" (unranked).
 * Click to add/remove from ranked list. Buttons to reorder.
 * Partial ranking allowed — rank your top N, leave others unranked.
 */
export function RankedChoiceWidget(
    props: RankedChoiceWidgetProps,
): React.ReactElement {
    const {options, hygiene, onChange, initialState} = props;

    // Internal state: ordered array of ranked option IDs
    const [rankedIds, setRankedIds] = React.useState<string[]>(() => {
        if (!initialState) {
            return [];
        }
        // Reconstruct ranked order from initialState
        const entries: Array<{id: string; rank: number}> = [];
        for (const opt of options) {
            const input = initialState[opt.id] as OptionInput | undefined;
            if (input?.rank != null && input.rank > 0) {
                entries.push({id: opt.id, rank: input.rank});
            }
        }
        entries.sort((a, b) => a.rank - b.rank);
        return entries.map((e) => e.id);
    });

    const buildBallotState = (ids: string[]): BallotUserInput => {
        const state: BallotUserInput = {};
        for (let i = 0; i < ids.length; i++) {
            state[ids[i]] = {rank: i + 1};
        }
        return state;
    };

    const handleRank = (optionId: string) => {
        setRankedIds((prev) => {
            const next = [...prev, optionId];
            onChange(buildBallotState(next));
            return next;
        });
    };

    const handleUnrank = (optionId: string) => {
        setRankedIds((prev) => {
            const next = prev.filter((id) => id !== optionId);
            onChange(buildBallotState(next));
            return next;
        });
    };

    const handleMoveUp = (optionId: string) => {
        setRankedIds((prev) => {
            const idx = prev.indexOf(optionId);
            if (idx <= 0) {
                return prev;
            }
            const next = [...prev];
            next[idx] = next[idx - 1];
            next[idx - 1] = optionId;
            onChange(buildBallotState(next));
            return next;
        });
    };

    const handleMoveDown = (optionId: string) => {
        setRankedIds((prev) => {
            const idx = prev.indexOf(optionId);
            if (idx < 0 || idx >= prev.length - 1) {
                return prev;
            }
            const next = [...prev];
            next[idx] = next[idx + 1];
            next[idx + 1] = optionId;
            onChange(buildBallotState(next));
            return next;
        });
    };

    const rankedSet = new Set(rankedIds);
    const unrankedOptions = options.filter((opt) => !rankedSet.has(opt.id));
    const optionMap = new Map(options.map((opt) => [opt.id, opt]));

    const equalWeightClass = hygiene.equalVisualWeight
        ? " psephos-equal-weight"
        : "";

    return (
        <div role="group" aria-label="Ranked-choice vote">
            <p className="psephos-instruction">
                Click options to rank them. Click ranked options to remove.
            </p>

            {/* Ranked zone */}
            <div
                role="listbox"
                aria-roledescription="ranking"
                aria-label="Ranked options"
            >
                {rankedIds.map((id, index) => {
                    const option = optionMap.get(id);
                    if (!option) {
                        return null;
                    }
                    return (
                        <div
                            key={id}
                            role="option"
                            aria-selected={true}
                            className={
                                "psephos-option psephos-ranked" +
                                equalWeightClass
                            }
                        >
                            <span className="psephos-rank-number">
                                {index + 1}
                            </span>
                            <button
                                type="button"
                                className="psephos-rank-label"
                                onClick={() => handleUnrank(id)}
                                aria-label={`Remove ${option.label} from ranking`}
                            >
                                {option.label}
                            </button>
                            {option.description && (
                                <p className="psephos-option-description">
                                    {option.description}
                                </p>
                            )}
                            <span className="psephos-rank-controls">
                                <button
                                    type="button"
                                    aria-label={`Move ${option.label} up`}
                                    disabled={index === 0}
                                    onClick={() => handleMoveUp(id)}
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Move ${option.label} down`}
                                    disabled={index === rankedIds.length - 1}
                                    onClick={() => handleMoveDown(id)}
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Remove ${option.label}`}
                                    onClick={() => handleUnrank(id)}
                                >
                                    ×
                                </button>
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Unranked zone */}
            {unrankedOptions.length > 0 && (
                <div aria-label="Unranked options">
                    <p className="psephos-zone-label">Not ranked</p>
                    {unrankedOptions.map((option) => (
                        <div
                            key={option.id}
                            className={
                                "psephos-option psephos-unranked" +
                                equalWeightClass
                            }
                        >
                            <button
                                type="button"
                                className="psephos-rank-label"
                                onClick={() => handleRank(option.id)}
                                aria-label={`Rank ${option.label}`}
                            >
                                {option.label}
                            </button>
                            {option.description && (
                                <p className="psephos-option-description">
                                    {option.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
