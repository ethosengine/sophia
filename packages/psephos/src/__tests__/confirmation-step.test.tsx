import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {ConfirmationStep} from "../hygiene/confirmation-step";

import type {
    PsephosBallot,
    BallotUserInput,
    PsephosOption,
    PsephosConfig,
    ElectionHygiene,
    PsephosProposal,
    VotingMechanism,
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
    hideVoterCount: true,
};

const defaultProposal: PsephosProposal = {
    id: "prop-1",
    title: "Test Proposal",
    description: "A test proposal",
    proposalType: "policy",
};

const defaultConfig: PsephosConfig = {};

const threeOptions: PsephosOption[] = [
    {id: "opt-a", label: "Option A", description: "", position: 0},
    {id: "opt-b", label: "Option B", description: "", position: 1},
    {id: "opt-c", label: "Option C", description: "", position: 2},
];

function makeBallot(
    mechanism: VotingMechanism,
    options?: PsephosOption[],
): PsephosBallot {
    return {
        id: "ballot-1",
        purpose: "governance",
        proposal: defaultProposal,
        options: options ?? threeOptions,
        mechanism,
        config: defaultConfig,
        hygiene: defaultHygiene,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("ConfirmationStep", () => {
    it("shows 'Review your ballot' heading", () => {
        const ballot = makeBallot("approval");
        const userInput: BallotUserInput = {};

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={userInput}
                onConfirm={jest.fn()}
                onGoBack={jest.fn()}
            />,
        );

        expect(screen.getByText("Review your ballot")).toBeInTheDocument();
    });

    it("shows approval summary", () => {
        const ballot = makeBallot("approval");
        const userInput: BallotUserInput = {
            "opt-a": {approved: true},
            "opt-c": {approved: true},
        };

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={userInput}
                onConfirm={jest.fn()}
                onGoBack={jest.fn()}
            />,
        );

        expect(
            screen.getByText("You approved: Option A, Option C"),
        ).toBeInTheDocument();
    });

    it("shows ranked-choice summary", () => {
        const ballot = makeBallot("ranked-choice");
        const userInput: BallotUserInput = {
            "opt-a": {rank: 2},
            "opt-b": {rank: 1},
        };

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={userInput}
                onConfirm={jest.fn()}
                onGoBack={jest.fn()}
            />,
        );

        expect(
            screen.getByText("Your ranking: 1. Option B, 2. Option A"),
        ).toBeInTheDocument();
    });

    it("shows consent summary for consent choice", () => {
        const consentOption: PsephosOption[] = [
            {
                id: "prop-x",
                label: "Adopt new charter",
                description: "",
                position: 0,
            },
        ];
        const ballot = makeBallot("consent", consentOption);
        const userInput: BallotUserInput = {
            "prop-x": {approved: true},
        };

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={userInput}
                onConfirm={jest.fn()}
                onGoBack={jest.fn()}
            />,
        );

        expect(screen.getByText("You chose to consent")).toBeInTheDocument();
    });

    it("shows consent summary for block choice", () => {
        const consentOption: PsephosOption[] = [
            {
                id: "prop-x",
                label: "Adopt new charter",
                description: "",
                position: 0,
            },
        ];
        const ballot = makeBallot("consent", consentOption);
        const userInput: BallotUserInput = {
            "prop-x": {approved: false},
        };

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={userInput}
                onConfirm={jest.fn()}
                onGoBack={jest.fn()}
            />,
        );

        expect(screen.getByText("You chose to block")).toBeInTheDocument();
    });

    it("Confirm button calls onConfirm", async () => {
        const onConfirm = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
        const ballot = makeBallot("approval");

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={{}}
                onConfirm={onConfirm}
                onGoBack={jest.fn()}
            />,
        );

        await user.click(screen.getByText("Confirm"));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("Go Back button calls onGoBack", async () => {
        const onGoBack = jest.fn();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
        const ballot = makeBallot("approval");

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={{}}
                onConfirm={jest.fn()}
                onGoBack={onGoBack}
            />,
        );

        await user.click(screen.getByText("Go Back"));

        expect(onGoBack).toHaveBeenCalledTimes(1);
    });

    it("shows reasoning when provided", () => {
        const ballot = makeBallot("approval");
        const userInput: BallotUserInput = {
            "opt-a": {approved: true},
            reasoning: "I believe Option A best serves the community",
        };

        render(
            <ConfirmationStep
                ballot={ballot}
                userInput={userInput}
                onConfirm={jest.fn()}
                onGoBack={jest.fn()}
            />,
        );

        expect(screen.getByText("Your reasoning:")).toBeInTheDocument();
        expect(
            screen.getByText("I believe Option A best serves the community"),
        ).toBeInTheDocument();
    });
});
