import * as React from "react";

import type {
    PsephosOption,
    ElectionHygiene,
    BallotUserInput,
    OptionInput,
} from "../types";

export interface ApprovalWidgetProps {
    options: PsephosOption[];
    hygiene: ElectionHygiene;
    onChange: (state: BallotUserInput) => void;
    initialState?: BallotUserInput;
}

/**
 * Approval voting widget — the simplest Psephos mechanism.
 *
 * Renders a checkbox per option. Voters may select as many options
 * as they approve of. No ranking, no scoring — just approve/disapprove.
 */
export function ApprovalWidget(props: ApprovalWidgetProps): React.ReactElement {
    const {options, hygiene, onChange, initialState} = props;

    const [state, setState] = React.useState<BallotUserInput>(
        () => initialState ?? {},
    );

    const handleToggle = (optionId: string) => {
        setState((prev) => {
            const current = prev[optionId] as OptionInput | undefined;
            const wasApproved = current?.approved ?? false;

            const next: BallotUserInput = {
                ...prev,
                [optionId]: {approved: !wasApproved},
            };

            onChange(next);
            return next;
        });
    };

    return (
        <div role="group" aria-label="Approval vote">
            <p className="psephos-instruction">
                You may select multiple options. Check each option you approve.
            </p>
            {options.map((option) => {
                const input = state[option.id] as OptionInput | undefined;
                const checked = input?.approved ?? false;

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
                        <label>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggle(option.id)}
                            />
                            {option.label}
                        </label>
                        {option.description && (
                            <p className="psephos-option-description">
                                {option.description}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
