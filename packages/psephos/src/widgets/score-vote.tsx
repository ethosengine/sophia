import * as React from "react";

import type {
    PsephosOption,
    ElectionHygiene,
    PsephosConfig,
    BallotUserInput,
    OptionInput,
} from "../types";

export interface ScoreVoteWidgetProps {
    options: ReadonlyArray<PsephosOption>;
    hygiene: ElectionHygiene;
    config: PsephosConfig;
    onChange: (state: BallotUserInput) => void;
    initialState?: BallotUserInput;
}

/**
 * Score voting widget — each option receives an independent score.
 *
 * Renders a range slider per option within [config.scoreMin, config.scoreMax].
 * Sliders visually start at the midpoint but are NOT counted as voted until
 * the voter explicitly interacts with them (anti-anchoring measure).
 */
export function ScoreVoteWidget(
    props: ScoreVoteWidgetProps,
): React.ReactElement {
    const {options, hygiene, config, onChange, initialState} = props;

    const min = config.scoreMin ?? 1;
    const max = config.scoreMax ?? 10;
    const midpoint = Math.round((min + max) / 2);

    // Track which options have been explicitly scored
    const [scoredIds, setScoredIds] = React.useState<Set<string>>(() => {
        if (!initialState) {
            return new Set();
        }
        const ids = new Set<string>();
        for (const option of options) {
            const input = initialState[option.id] as OptionInput | undefined;
            if (input?.score != null) {
                ids.add(option.id);
            }
        }
        return ids;
    });

    const [state, setState] = React.useState<BallotUserInput>(
        () => initialState ?? {},
    );

    const handleChange = (optionId: string, value: number) => {
        setScoredIds((prev) => {
            const next = new Set(prev);
            next.add(optionId);
            return next;
        });

        setState((prev) => {
            const next: BallotUserInput = {
                ...prev,
                [optionId]: {score: value},
            };

            // Build onChange payload: only include explicitly scored options
            const payload: BallotUserInput = {};
            for (const option of options) {
                if (option.id === optionId || scoredIds.has(option.id)) {
                    const input =
                        option.id === optionId
                            ? {score: value}
                            : (next[option.id] as OptionInput | undefined);
                    if (input?.score != null) {
                        payload[option.id] = input;
                    }
                }
            }

            onChange(payload);
            return next;
        });
    };

    const getDisplayValue = (optionId: string): number => {
        const input = state[optionId] as OptionInput | undefined;
        if (input?.score != null) {
            return input.score;
        }
        return midpoint;
    };

    return (
        <div role="group" aria-label="Score vote">
            <p className="psephos-instruction">
                Score each option. All options must be scored.
            </p>
            {options.map((option) => {
                const displayValue = getDisplayValue(option.id);
                const isScored = scoredIds.has(option.id);

                return (
                    <div
                        key={option.id}
                        className={
                            "psephos-option" +
                            (hygiene.equalVisualWeight
                                ? " psephos-equal-weight"
                                : "")
                        }
                    >
                        <label htmlFor={`score-${option.id}`}>
                            {option.label}
                        </label>
                        {option.description && (
                            <p className="psephos-option-description">
                                {option.description}
                            </p>
                        )}
                        <div className="psephos-score-row">
                            <span
                                className="psephos-score-label"
                                aria-hidden="true"
                            >
                                {min}
                            </span>
                            <input
                                id={`score-${option.id}`}
                                type="range"
                                min={min}
                                max={max}
                                value={displayValue}
                                aria-label={`Score for ${option.label}`}
                                aria-valuenow={
                                    isScored ? displayValue : undefined
                                }
                                onChange={(e) =>
                                    handleChange(
                                        option.id,
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <span
                                className="psephos-score-label"
                                aria-hidden="true"
                            >
                                {max}
                            </span>
                            <span
                                className="psephos-score-value"
                                aria-live="polite"
                            >
                                {isScored ? displayValue : "—"}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
