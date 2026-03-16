import {render, screen, within} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {RankedChoiceWidget} from "../widgets/ranked-choice";

import type {PsephosOption, ElectionHygiene, BallotUserInput} from "../types";

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

const threeOptions: ReadonlyArray<PsephosOption> = [
    {id: "opt-a", label: "Option A", description: "", position: 0},
    {id: "opt-b", label: "Option B", description: "", position: 1},
    {id: "opt-c", label: "Option C", description: "", position: 2},
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("RankedChoiceWidget", () => {
    it("renders all options in the unranked zone initially", () => {
        const onChange = jest.fn();
        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByRole("button", {name: /rank option a/i}),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {name: /rank option b/i}),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {name: /rank option c/i}),
        ).toBeInTheDocument();

        // Ranked zone should be empty (no options)
        const listbox = screen.getByRole("listbox");
        expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
    });

    it("clicking an unranked option moves it to ranked zone with rank 1", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: /rank option a/i}));

        // Should now appear in ranked zone
        const listbox = screen.getByRole("listbox");
        const rankedOptions = within(listbox).getAllByRole("option");
        expect(rankedOptions).toHaveLength(1);
        expect(rankedOptions[0]).toHaveTextContent("Option A");
    });

    it("clicking a second unranked option ranks it after first (rank 2)", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: /rank option a/i}));
        await user.click(screen.getByRole("button", {name: /rank option b/i}));

        const listbox = screen.getByRole("listbox");
        const rankedOptions = within(listbox).getAllByRole("option");
        expect(rankedOptions).toHaveLength(2);
        expect(rankedOptions[0]).toHaveTextContent("1");
        expect(rankedOptions[0]).toHaveTextContent("Option A");
        expect(rankedOptions[1]).toHaveTextContent("2");
        expect(rankedOptions[1]).toHaveTextContent("Option B");
    });

    it("clicking a ranked option removes it back to unranked", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        // Rank option A
        await user.click(screen.getByRole("button", {name: /rank option a/i}));

        // Remove it by clicking the label button in ranked zone
        await user.click(
            screen.getByRole("button", {
                name: /remove option a from ranking/i,
            }),
        );

        // Should be back in unranked
        const listbox = screen.getByRole("listbox");
        expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
        expect(
            screen.getByRole("button", {name: /rank option a/i}),
        ).toBeInTheDocument();
    });

    it("moving up/down reorders ranks", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        // Rank A then B
        await user.click(screen.getByRole("button", {name: /rank option a/i}));
        await user.click(screen.getByRole("button", {name: /rank option b/i}));

        // Move B up (should swap with A)
        await user.click(
            screen.getByRole("button", {name: /move option b up/i}),
        );

        const listbox = screen.getByRole("listbox");
        const rankedOptions = within(listbox).getAllByRole("option");
        expect(rankedOptions[0]).toHaveTextContent("Option B");
        expect(rankedOptions[1]).toHaveTextContent("Option A");

        // Move B down (should swap back)
        await user.click(
            screen.getByRole("button", {name: /move option b down/i}),
        );

        const reordered = within(listbox).getAllByRole("option");
        expect(reordered[0]).toHaveTextContent("Option A");
        expect(reordered[1]).toHaveTextContent("Option B");
    });

    it("calls onChange with correct BallotUserInput", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: /rank option b/i}));

        expect(onChange).toHaveBeenCalledWith({
            "opt-b": {rank: 1},
        });

        await user.click(screen.getByRole("button", {name: /rank option a/i}));

        expect(onChange).toHaveBeenLastCalledWith({
            "opt-b": {rank: 1},
            "opt-a": {rank: 2},
        });
    });

    it("restores previous state from initialState", () => {
        const onChange = jest.fn();
        const initialState: BallotUserInput = {
            "opt-c": {rank: 1},
            "opt-a": {rank: 2},
        };

        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
                initialState={initialState}
            />,
        );

        const listbox = screen.getByRole("listbox");
        const rankedOptions = within(listbox).getAllByRole("option");
        expect(rankedOptions).toHaveLength(2);
        expect(rankedOptions[0]).toHaveTextContent("1");
        expect(rankedOptions[0]).toHaveTextContent("Option C");
        expect(rankedOptions[1]).toHaveTextContent("2");
        expect(rankedOptions[1]).toHaveTextContent("Option A");

        // Option B should still be in unranked
        expect(
            screen.getByRole("button", {name: /rank option b/i}),
        ).toBeInTheDocument();
    });

    it("shows instruction text", () => {
        const onChange = jest.fn();
        render(
            <RankedChoiceWidget
                options={threeOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByText(
                /click options to rank them\. click ranked options to remove\./i,
            ),
        ).toBeInTheDocument();
    });
});
