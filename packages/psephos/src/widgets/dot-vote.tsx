import * as React from "react";

import type {
    PsephosOption,
    ElectionHygiene,
    PsephosConfig,
    BallotUserInput,
    OptionInput,
} from "../types";

export interface DotVoteWidgetProps {
    options: ReadonlyArray<PsephosOption>;
    hygiene: ElectionHygiene;
    config: PsephosConfig;
    onChange: (state: BallotUserInput) => void;
    initialState?: BallotUserInput;
}

/**
 * Dot voting widget — budget-constrained allocation.
 *
 * Voters distribute a fixed number of dots across options using
 * increment/decrement buttons. Budget is enforced: total allocated
 * dots cannot exceed config.dotsPerVoter. Zero allocation is valid
 * (intentional non-allocation).
 */
export function DotVoteWidget(props: DotVoteWidgetProps): React.ReactElement {
    const {options, hygiene, config, onChange, initialState} = props;
    const dotsPerVoter = config.dotsPerVoter ?? 0;

    const [state, setState] = React.useState<BallotUserInput>(
        () => initialState ?? {},
    );

    const getDotsForOption = (optionId: string): number => {
        const input = state[optionId] as OptionInput | undefined;
        return input?.dots ?? 0;
    };

    const totalAllocated = options.reduce(
        (sum, opt) => sum + getDotsForOption(opt.id),
        0,
    );
    const remaining = dotsPerVoter - totalAllocated;

    const handleIncrement = (optionId: string) => {
        if (remaining <= 0) {
            return;
        }
        setState((prev) => {
            const current = prev[optionId] as OptionInput | undefined;
            const currentDots = current?.dots ?? 0;
            const next: BallotUserInput = {
                ...prev,
                [optionId]: {dots: currentDots + 1},
            };
            onChange(next);
            return next;
        });
    };

    const handleDecrement = (optionId: string) => {
        const currentDots = getDotsForOption(optionId);
        if (currentDots <= 0) {
            return;
        }
        setState((prev) => {
            const current = prev[optionId] as OptionInput | undefined;
            const dots = current?.dots ?? 0;
            const next: BallotUserInput = {
                ...prev,
                [optionId]: {dots: dots - 1},
            };
            onChange(next);
            return next;
        });
    };

    return (
        <div role="group" aria-label="Dot vote">
            <p className="psephos-instruction">
                Allocate your dots across options. You have {dotsPerVoter} dots
                to distribute.
            </p>
            <p aria-live="polite" className="psephos-budget">
                {remaining} dots remaining
            </p>
            {options.map((option) => {
                const dots = getDotsForOption(option.id);

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
                        <span className="psephos-option-label">
                            {option.label}
                        </span>
                        {option.description && (
                            <p className="psephos-option-description">
                                {option.description}
                            </p>
                        )}
                        <div className="psephos-dot-controls">
                            <button
                                type="button"
                                aria-label={`Remove dot from ${option.label}`}
                                disabled={dots <= 0}
                                onClick={() => handleDecrement(option.id)}
                            >
                                −
                            </button>
                            <span
                                aria-label={`${option.label} dots`}
                                className="psephos-dot-count"
                            >
                                {dots}
                            </span>
                            <button
                                type="button"
                                aria-label={`Add dot to ${option.label}`}
                                disabled={remaining <= 0}
                                onClick={() => handleIncrement(option.id)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
