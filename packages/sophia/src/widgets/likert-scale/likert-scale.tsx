import * as React from "react";
import {useCallback, useMemo} from "react";

import type {WidgetProps} from "../../types";
import type {
    PerseusLikertScaleWidgetOptions,
    PerseusLikertScaleUserInput,
} from "@ethosengine/perseus-core";

type Props = WidgetProps<
    PerseusLikertScaleWidgetOptions,
    PerseusLikertScaleUserInput
>;

type ValidateResult = {type: "invalid"; message: null} | null;

function LikertScale(props: Props): React.ReactElement {
    const {
        min = 1,
        max = 7,
        step = 1,
        minLabel = "",
        maxLabel = "",
        handleUserInput,
        userInput,
        trackInteraction,
    } = props;

    const selectedValue = userInput?.value ?? null;

    const values = useMemo(() => {
        const result: number[] = [];
        for (let v = min; v <= max; v += step) {
            result.push(v);
        }
        return result;
    }, [min, max, step]);

    const handleSelect = useCallback(
        (value: number) => {
            handleUserInput({value});
            trackInteraction();
        },
        [handleUserInput, trackInteraction],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, currentIndex: number) => {
            let nextIndex: number | null = null;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                nextIndex = Math.min(currentIndex + 1, values.length - 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                nextIndex = Math.max(currentIndex - 1, 0);
            }
            if (nextIndex != null) {
                handleSelect(values[nextIndex]);
            }
        },
        [handleSelect, values],
    );

    return (
        <div
            data-testid="likert-scale-widget"
            role="radiogroup"
            style={{padding: "8px 0"}}
        >
            <div
                data-testid="likert-scale-track"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    padding: "16px 0",
                }}
            >
                {/* Track line */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "#ccc",
                        transform: "translateY(-50%)",
                        zIndex: 0,
                    }}
                />

                {values.map((value, index) => {
                    const isSelected = value === selectedValue;
                    const isFocusable =
                        isSelected || (selectedValue == null && index === 0);
                    return (
                        <button
                            key={value}
                            data-testid={
                                isSelected
                                    ? "likert-scale-thumb"
                                    : "likert-scale-tick"
                            }
                            data-value={value}
                            onClick={() => handleSelect(value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            aria-checked={isSelected}
                            aria-label={`${value}`}
                            role="radio"
                            tabIndex={isFocusable ? 0 : -1}
                            style={{
                                position: "relative",
                                zIndex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px 8px",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    width: isSelected ? 20 : 12,
                                    height: isSelected ? 20 : 12,
                                    borderRadius: "50%",
                                    border: `2px solid ${isSelected ? "#1865f2" : "#888"}`,
                                    backgroundColor: isSelected
                                        ? "#1865f2"
                                        : "#fff",
                                    transition: "all 0.15s ease",
                                }}
                            />
                            <span
                                data-testid="likert-scale-value"
                                style={{
                                    marginTop: 4,
                                    fontSize: 12,
                                    color: isSelected ? "#1865f2" : "#666",
                                    fontWeight: isSelected ? "bold" : "normal",
                                }}
                            >
                                {value}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 8px",
                }}
            >
                <span
                    data-testid="likert-scale-min-label"
                    style={{fontSize: 13, color: "#666"}}
                >
                    {minLabel}
                </span>
                <span
                    data-testid="likert-scale-max-label"
                    style={{fontSize: 13, color: "#666"}}
                >
                    {maxLabel}
                </span>
            </div>
        </div>
    );
}

const LikertScaleWithValidate = LikertScale as typeof LikertScale & {
    validate: (userInput: PerseusLikertScaleUserInput) => ValidateResult;
};

LikertScaleWithValidate.validate = (
    userInput: PerseusLikertScaleUserInput,
): ValidateResult => {
    if (userInput.value == null) {
        return {type: "invalid" as const, message: null};
    }
    return null;
};

export default LikertScaleWithValidate;
