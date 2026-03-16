import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {DotVoteWidget} from "../widgets/dot-vote";

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
    confirmBeforeSubmit: false,
    hideVoterCount: true,
};

const defaultConfig: PsephosConfig = {
    dotsPerVoter: 5,
};

const threeOptions: PsephosOption[] = [
    {id: "opt-a", label: "Option A", description: "", position: 0},
    {id: "opt-b", label: "Option B", description: "", position: 1},
    {id: "opt-c", label: "Option C", description: "", position: 2},
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("DotVoteWidget", () => {
    it("shows 'N dots remaining' label with correct total", () => {
        const onChange = jest.fn();
        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        expect(screen.getByText("5 dots remaining")).toBeInTheDocument();
    });

    it("renders increment and decrement buttons per option", () => {
        const onChange = jest.fn();
        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        for (const opt of threeOptions) {
            expect(
                screen.getByLabelText(`Add dot to ${opt.label}`),
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText(`Remove dot from ${opt.label}`),
            ).toBeInTheDocument();
        }
    });

    it("incrementing adds a dot and decrements remaining budget", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByLabelText("Add dot to Option A"));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                "opt-a": {dots: 1},
            }),
        );
        expect(screen.getByText("4 dots remaining")).toBeInTheDocument();
    });

    it("can't exceed total budget (increment disabled when 0 remaining)", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        const smallBudget: PsephosConfig = {dotsPerVoter: 2};

        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={smallBudget}
                onChange={onChange}
            />,
        );

        // Allocate all 2 dots to Option A
        await user.click(screen.getByLabelText("Add dot to Option A"));
        await user.click(screen.getByLabelText("Add dot to Option A"));

        expect(screen.getByText("0 dots remaining")).toBeInTheDocument();

        // All increment buttons should be disabled
        expect(screen.getByLabelText("Add dot to Option A")).toBeDisabled();
        expect(screen.getByLabelText("Add dot to Option B")).toBeDisabled();
        expect(screen.getByLabelText("Add dot to Option C")).toBeDisabled();
    });

    it("can't go below 0 (decrement disabled at 0)", () => {
        const onChange = jest.fn();
        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        // All decrement buttons should start disabled
        expect(
            screen.getByLabelText("Remove dot from Option A"),
        ).toBeDisabled();
        expect(
            screen.getByLabelText("Remove dot from Option B"),
        ).toBeDisabled();
        expect(
            screen.getByLabelText("Remove dot from Option C"),
        ).toBeDisabled();
    });

    it("shows current dot count per option", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        // All start at 0
        const dotCounts = screen.getAllByLabelText(/dots$/);
        expect(dotCounts).toHaveLength(3);
        for (const count of dotCounts) {
            expect(count).toHaveTextContent("0");
        }

        // Increment Option B twice
        await user.click(screen.getByLabelText("Add dot to Option B"));
        await user.click(screen.getByLabelText("Add dot to Option B"));

        expect(screen.getByLabelText("Option B dots")).toHaveTextContent("2");
    });

    it("restores previous state from initialState", () => {
        const onChange = jest.fn();
        const initialState: BallotUserInput = {
            "opt-a": {dots: 2},
            "opt-b": {dots: 1},
        };

        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
                initialState={initialState}
            />,
        );

        expect(screen.getByLabelText("Option A dots")).toHaveTextContent("2");
        expect(screen.getByLabelText("Option B dots")).toHaveTextContent("1");
        expect(screen.getByLabelText("Option C dots")).toHaveTextContent("0");
        expect(screen.getByText("2 dots remaining")).toBeInTheDocument();
    });

    it("budget label updates as dots are allocated (ARIA live region)", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <DotVoteWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                config={defaultConfig}
                onChange={onChange}
            />,
        );

        const budgetRegion = screen.getByText("5 dots remaining");
        expect(budgetRegion).toHaveAttribute("aria-live", "polite");

        await user.click(screen.getByLabelText("Add dot to Option A"));
        expect(budgetRegion).toHaveTextContent("4 dots remaining");

        await user.click(screen.getByLabelText("Add dot to Option B"));
        expect(budgetRegion).toHaveTextContent("3 dots remaining");
    });
});
