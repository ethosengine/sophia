import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {ApprovalWidget} from "../widgets/approval";

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

const twoOptions: PsephosOption[] = [
    {id: "opt-a", label: "Option A", description: "", position: 0},
    {id: "opt-b", label: "Option B", description: "", position: 1},
];

const optionsWithDescriptions: PsephosOption[] = [
    {
        id: "opt-x",
        label: "Proposal X",
        description: "Expand the community garden",
        position: 0,
    },
    {
        id: "opt-y",
        label: "Proposal Y",
        description: "Install solar panels",
        position: 1,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("ApprovalWidget", () => {
    it("renders all options as checkboxes", () => {
        const onChange = jest.fn();
        render(
            <ApprovalWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(screen.getByLabelText("Option A")).toBeInTheDocument();
        expect(screen.getByLabelText("Option B")).toBeInTheDocument();
    });

    it('shows "select multiple" instruction text', () => {
        const onChange = jest.fn();
        render(
            <ApprovalWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByText(/you may select multiple options/i),
        ).toBeInTheDocument();
    });

    it("no options are pre-checked by default", () => {
        const onChange = jest.fn();
        render(
            <ApprovalWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(2);
        for (const cb of checkboxes) {
            expect(cb).not.toBeChecked();
        }
    });

    it("calls onChange with updated state when option toggled", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ApprovalWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByLabelText("Option A"));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({
            "opt-a": {approved: true},
        });
    });

    it("allows toggling multiple options", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ApprovalWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByLabelText("Option A"));
        await user.click(screen.getByLabelText("Option B"));

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenLastCalledWith({
            "opt-a": {approved: true},
            "opt-b": {approved: true},
        });
    });

    it("shows descriptions when provided", () => {
        const onChange = jest.fn();
        render(
            <ApprovalWidget
                options={optionsWithDescriptions}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByText("Expand the community garden"),
        ).toBeInTheDocument();
        expect(screen.getByText("Install solar panels")).toBeInTheDocument();
    });

    it("restores previous state when initialState provided", () => {
        const onChange = jest.fn();
        const initialState: BallotUserInput = {
            "opt-a": {approved: true},
            "opt-b": {approved: false},
        };

        render(
            <ApprovalWidget
                options={twoOptions}
                hygiene={defaultHygiene}
                onChange={onChange}
                initialState={initialState}
            />,
        );

        expect(screen.getByLabelText("Option A")).toBeChecked();
        expect(screen.getByLabelText("Option B")).not.toBeChecked();
    });
});
