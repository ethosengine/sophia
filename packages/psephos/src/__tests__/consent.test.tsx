import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {ConsentWidget} from "../widgets/consent";

import type {PsephosOption, ElectionHygiene, BallotUserInput} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const defaultHygiene: ElectionHygiene = {
    randomizeOrder: false,
    equalVisualWeight: true,
    requireReasoning: false,
    reasoningMinLength: 50,
    showResultsAfterVote: true,
    confirmBeforeSubmit: true,
    hideVoterCount: true,
};

const proposal: PsephosOption[] = [
    {
        id: "prop-1",
        label: "Adopt new community guidelines",
        description:
            "Replace the existing code of conduct with updated guidelines",
        position: 0,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("ConsentWidget", () => {
    it("renders Consent and Block buttons", () => {
        const onChange = jest.fn();
        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByRole("button", {name: "Consent"}),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Block"})).toBeInTheDocument();
    });

    it("buttons have equal visual weight (same CSS class)", () => {
        const onChange = jest.fn();
        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        const consentBtn = screen.getByRole("button", {name: "Consent"});
        const blockBtn = screen.getByRole("button", {name: "Block"});

        expect(consentBtn.className).toContain("psephos-equal-weight");
        expect(blockBtn.className).toContain("psephos-equal-weight");
    });

    it("selecting Block shows reasoning textarea", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        // No textarea before clicking
        expect(
            screen.queryByLabelText("Block reasoning"),
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "Block"}));

        expect(screen.getByLabelText("Block reasoning")).toBeInTheDocument();
    });

    it("Block requires minimum character count and shows validation message", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: "Block"}));

        // With empty reasoning, validation message should appear
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
            screen.getByText(/please provide at least 50 characters/i),
        ).toBeInTheDocument();

        // Type enough characters to satisfy minimum
        const textarea = screen.getByLabelText("Block reasoning");
        await user.type(
            textarea,
            "This proposal needs more discussion because it affects everyone",
        );

        // Validation message should disappear (text is > 50 chars)
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("Consent is valid without reasoning", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: "Consent"}));

        // Should show optional reasoning textarea, no validation error
        expect(screen.getByLabelText("Consent reasoning")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows facilitation explanation text", () => {
        const onChange = jest.fn();
        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        expect(screen.getByText(/blocking does not veto/i)).toBeInTheDocument();
        expect(
            screen.getByText(/triggers a facilitated conversation/i),
        ).toBeInTheDocument();
    });

    it("calls onChange with approved:true for consent", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: "Consent"}));

        expect(onChange).toHaveBeenCalledWith({
            "prop-1": {approved: true},
            reasoning: undefined,
        });
    });

    it("calls onChange with approved:false for block", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: "Block"}));

        expect(onChange).toHaveBeenCalledWith({
            "prop-1": {approved: false},
            reasoning: undefined,
        });
    });

    it("Block reasoning is included in onChange state", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole("button", {name: "Block"}));
        onChange.mockClear();

        const textarea = screen.getByLabelText("Block reasoning");
        await user.type(textarea, "I have concerns about section 3");

        // Last call should include the full reasoning text
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall).toEqual({
            "prop-1": {approved: false},
            reasoning: "I have concerns about section 3",
        });
    });

    it("restores previous state from initialState", () => {
        const onChange = jest.fn();
        const initialState: BallotUserInput = {
            "prop-1": {approved: false},
            reasoning: "Need more community input before proceeding",
        };

        render(
            <ConsentWidget
                options={proposal}
                hygiene={defaultHygiene}
                onChange={onChange}
                initialState={initialState}
            />,
        );

        // Block button should be selected
        const blockBtn = screen.getByRole("button", {name: "Block"});
        expect(blockBtn).toHaveAttribute("aria-pressed", "true");

        // Reasoning textarea should be visible with restored text
        const textarea = screen.getByLabelText("Block reasoning");
        expect(textarea).toHaveValue(
            "Need more community input before proceeding",
        );
    });
});
