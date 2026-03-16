import * as React from "react";

import type {
    PsephosOption,
    ElectionHygiene,
    BallotUserInput,
    OptionInput,
} from "../types";

export interface ConsentWidgetProps {
    options: ReadonlyArray<PsephosOption>;
    hygiene: ElectionHygiene;
    onChange: (state: BallotUserInput) => void;
    initialState?: BallotUserInput;
}

const DEFAULT_REASONING_MIN_LENGTH = 50;

/**
 * Consent voting widget — binary consent/block on a proposal.
 *
 * Unlike other Psephos widgets that render N options, the consent widget
 * presents a single proposal with two choices: Consent or Block.
 * Blocking triggers a facilitated conversation, not a veto.
 *
 * Block requires a reasoning explanation (minimum character count).
 * Consent optionally accepts reasoning.
 */
export function ConsentWidget(props: ConsentWidgetProps): React.ReactElement {
    const {options, hygiene, onChange, initialState} = props;

    const proposal = options[0];
    const proposalId = proposal?.id ?? "";

    const reasoningMinLength =
        hygiene.reasoningMinLength ?? DEFAULT_REASONING_MIN_LENGTH;

    const [choice, setChoice] = React.useState<"consent" | "block" | null>(
        () => {
            if (!initialState) {
                return null;
            }
            const input = initialState[proposalId] as OptionInput | undefined;
            if (input?.approved === true) {
                return "consent";
            }
            if (input?.approved === false) {
                return "block";
            }
            return null;
        },
    );

    const [reasoning, setReasoning] = React.useState<string>(
        () => (initialState?.reasoning as string) ?? "",
    );

    const fireOnChange = React.useCallback(
        (nextChoice: "consent" | "block", nextReasoning: string) => {
            const next: BallotUserInput = {
                [proposalId]: {
                    approved: nextChoice === "consent",
                },
                reasoning: nextReasoning || undefined,
            };
            onChange(next);
        },
        [onChange, proposalId],
    );

    const handleConsent = () => {
        setChoice("consent");
        fireOnChange("consent", reasoning);
    };

    const handleBlock = () => {
        setChoice("block");
        fireOnChange("block", reasoning);
    };

    const handleReasoningChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const text = e.target.value;
        setReasoning(text);
        if (choice) {
            fireOnChange(choice, text);
        }
    };

    const blockReasoningTooShort =
        choice === "block" && reasoning.length < reasoningMinLength;

    return (
        <div role="group" aria-label="Consent vote">
            {proposal != null && (
                <div className="psephos-proposal">
                    <h3>{proposal.label}</h3>
                    {proposal.description && (
                        <p className="psephos-option-description">
                            {proposal.description}
                        </p>
                    )}
                </div>
            )}

            <div className="psephos-consent-buttons">
                <button
                    type="button"
                    className={
                        "psephos-consent-btn psephos-equal-weight" +
                        (choice === "consent" ? " psephos-selected" : "")
                    }
                    aria-pressed={choice === "consent"}
                    onClick={handleConsent}
                >
                    Consent
                </button>
                <button
                    type="button"
                    className={
                        "psephos-block-btn psephos-equal-weight" +
                        (choice === "block" ? " psephos-selected" : "")
                    }
                    aria-pressed={choice === "block"}
                    onClick={handleBlock}
                >
                    Block
                </button>
            </div>

            <p className="psephos-instruction">
                {"Blocking does not veto \u2014 " +
                    "it triggers a facilitated conversation."}
            </p>

            {choice === "block" && (
                <div className="psephos-reasoning">
                    <label>
                        Reason for blocking (required)
                        <textarea
                            value={reasoning}
                            onChange={handleReasoningChange}
                            aria-label="Block reasoning"
                            minLength={reasoningMinLength}
                        />
                    </label>
                    {blockReasoningTooShort && (
                        <p className="psephos-validation-error" role="alert">
                            Please provide at least {reasoningMinLength}{" "}
                            characters ({reasoning.length}/{reasoningMinLength})
                        </p>
                    )}
                </div>
            )}

            {choice === "consent" && (
                <div className="psephos-reasoning">
                    <label>
                        Reasoning (optional)
                        <textarea
                            value={reasoning}
                            onChange={handleReasoningChange}
                            aria-label="Consent reasoning"
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
