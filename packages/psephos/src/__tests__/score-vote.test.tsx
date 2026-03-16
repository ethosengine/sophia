import {act, render, screen} from "@testing-library/react";
import * as React from "react";

import {ScoreVoteWidget} from "../widgets/score-vote";

import type {
    PsephosOption,
    ElectionHygiene,
    PsephosConfig,
    BallotUserInput,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const defaultHygiene: ElectionHygiene = {
    randomizeOrder: false,
    equalVisualWeight: true,
    requireReasoning: false,
    showResultsAfterVote: true,
    confirmBeforeSubmit: true,
    hideVoterCount: false,
};

const defaultConfig: PsephosConfig = {
    scoreMin: 1,
    scoreMax: 10,
};

const twoOptions: PsephosOption[] = [
    {id: "opt-a", label: "Option A", description: "", position: 0},
    {id: "opt-b", label: "Option B", description: "", position: 1},
];

/**
 * Simulate a range input change by setting the value property
 * and dispatching a native input+change event. Range inputs
 * cannot be driven via userEvent.type or userEvent.selectOptions.
 */
function setSliderValue(slider: HTMLElement, value: string): void {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
    )?.set;
    nativeInputValueSetter?.call(slider, value);
    slider.dispatchEvent(new Event("input", {bubbles: true}));
    slider.dispatchEvent(new Event("change", {bubbles: true}));
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("ScoreVoteWidget", () => {
    it("renders a slider per option with labels", () => {
        const onChange = jest.fn();
        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        const sliders = screen.getAllByRole("slider");
        expect(sliders).toHaveLength(2);
        expect(screen.getByLabelText("Score for Option A")).toBeInTheDocument();
        expect(screen.getByLabelText("Score for Option B")).toBeInTheDocument();
    });

    it("shows instruction text about scoring all options", () => {
        const onChange = jest.fn();
        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByText(/score each option\. all options must be scored/i),
        ).toBeInTheDocument();
    });

    it("sliders show at visual midpoint initially", () => {
        const onChange = jest.fn();
        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        const sliders = screen.getAllByRole("slider");
        // midpoint of 1..10 = round(5.5) = 6
        for (const slider of sliders) {
            expect(slider).toHaveValue("6");
        }
    });

    it("interacting with slider marks it as scored and calls onChange", () => {
        const onChange = jest.fn();

        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        // Unscored options show dash
        const valueDisplays = screen.getAllByText("\u2014");
        expect(valueDisplays).toHaveLength(2);

        // Simulate slider interaction
        const sliderA = screen.getByLabelText("Score for Option A");
        act(() => setSliderValue(sliderA, "8"));

        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall["opt-a"]).toEqual({score: 8});
        // opt-b should NOT be in the payload (not yet interacted)
        expect(lastCall["opt-b"]).toBeUndefined();
    });

    it("score constrained to [min, max] range", () => {
        const onChange = jest.fn();
        const narrowConfig: PsephosConfig = {scoreMin: 1, scoreMax: 5};

        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={narrowConfig}
                onChange={onChange}
            />,
        );

        const sliders = screen.getAllByRole("slider");
        for (const slider of sliders) {
            expect(slider).toHaveAttribute("min", "1");
            expect(slider).toHaveAttribute("max", "5");
        }
    });

    it("restores previous state from initialState", () => {
        const onChange = jest.fn();
        const initialState: BallotUserInput = {
            "opt-a": {score: 3},
            "opt-b": {score: 9},
        };

        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
                initialState={initialState}
            />,
        );

        const sliderA = screen.getByLabelText("Score for Option A");
        const sliderB = screen.getByLabelText("Score for Option B");

        expect(sliderA).toHaveValue("3");
        expect(sliderB).toHaveValue("9");

        // Score values should be displayed (not dashes)
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("9")).toBeInTheDocument();
    });

    it("displays current score value next to each slider", () => {
        const onChange = jest.fn();

        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        // Initially shows dashes for unscored
        expect(screen.getAllByText("\u2014")).toHaveLength(2);

        // Score option A
        const sliderA = screen.getByLabelText("Score for Option A");
        act(() => setSliderValue(sliderA, "7"));

        // Should show the score value
        expect(screen.getByText("7")).toBeInTheDocument();
        // Option B still unscored
        expect(screen.getAllByText("\u2014")).toHaveLength(1);
    });

    it("displays endpoint labels from config", () => {
        const onChange = jest.fn();
        const customConfig: PsephosConfig = {
            scoreMin: 0,
            scoreMax: 100,
        };

        render(
            <ScoreVoteWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                config={customConfig}
                onChange={onChange}
            />,
        );

        // Each option row has min and max labels
        expect(screen.getAllByText("0")).toHaveLength(2);
        expect(screen.getAllByText("100")).toHaveLength(2);
    });
});
