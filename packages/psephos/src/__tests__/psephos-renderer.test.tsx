import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {DEFAULT_HYGIENE, PsephosRenderer} from "../index";

import type {PsephosBallot} from "../index";
import type {Recognition} from "@ethosengine/sophia-core";

const approvalBallot: PsephosBallot = {
    id: "ballot-1",
    purpose: "governance",
    proposal: {
        id: "prop-1",
        title: "Test Proposal",
        description: "Should we do the thing?",
        proposalType: "advice",
    },
    options: [
        {id: "opt-1", label: "Yes", description: "Proceed", position: 0},
        {id: "opt-2", label: "No", description: "Don't proceed", position: 1},
    ],
    mechanism: "approval",
    config: {},
    hygiene: {...DEFAULT_HYGIENE.approval, randomizeOrder: false},
};

function setupUser() {
    return userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
    });
}

describe("PsephosRenderer", () => {
    it("renders proposal title and description", () => {
        render(<PsephosRenderer ballot={approvalBallot} />);

        expect(screen.getByText("Test Proposal")).toBeInTheDocument();
        expect(screen.getByText("Should we do the thing?")).toBeInTheDocument();
    });

    it("renders approval widget for approval mechanism", () => {
        render(<PsephosRenderer ballot={approvalBallot} />);

        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("No")).toBeInTheDocument();
    });

    it("shows submit button", () => {
        render(<PsephosRenderer ballot={approvalBallot} />);

        const button = screen.getByRole("button", {name: "Submit ballot"});
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("Submit Ballot");
    });

    it("submit button is disabled until ballot is valid", () => {
        render(<PsephosRenderer ballot={approvalBallot} />);

        const button = screen.getByRole("button", {name: "Submit ballot"});
        expect(button).toBeDisabled();
    });

    it("submit button enables after selecting an option", async () => {
        const user = setupUser();
        render(<PsephosRenderer ballot={approvalBallot} />);

        const yesCheckbox = screen.getByRole("checkbox", {name: "Yes"});
        await user.click(yesCheckbox);

        const button = screen.getByRole("button", {name: "Submit ballot"});
        expect(button).toBeEnabled();
    });

    it("fires onRecognition with GovernanceResult on submit", async () => {
        const user = setupUser();
        const handleRecognition = jest.fn();

        render(
            <PsephosRenderer
                ballot={approvalBallot}
                onRecognition={handleRecognition}
            />,
        );

        // Select "Yes"
        const yesCheckbox = screen.getByRole("checkbox", {name: "Yes"});
        await user.click(yesCheckbox);

        // Submit
        const button = screen.getByRole("button", {name: "Submit ballot"});
        await user.click(button);

        expect(handleRecognition).toHaveBeenCalledTimes(1);

        const recognition: Recognition = handleRecognition.mock.calls[0][0];
        expect(recognition.purpose).toBe("governance");
        expect(recognition.governance).toBeDefined();
        expect(recognition.governance!.mechanism).toBe("approval");
        expect(recognition.governance!.proposalId).toBe("prop-1");
        expect(recognition.governance!.ballots).toEqual([
            {optionId: "opt-1", approved: true},
            {optionId: "opt-2", approved: null},
        ]);
    });

    it("shows 'not yet implemented' for unsupported mechanisms", () => {
        const rankedBallot: PsephosBallot = {
            ...approvalBallot,
            mechanism: "ranked-choice",
        };

        render(<PsephosRenderer ballot={rankedBallot} />);

        expect(
            screen.getByText(/Mechanism 'ranked-choice' not yet implemented/),
        ).toBeInTheDocument();
    });

    it("hides submit button in reviewMode", () => {
        render(<PsephosRenderer ballot={approvalBallot} reviewMode={true} />);

        expect(
            screen.queryByRole("button", {name: "Submit ballot"}),
        ).not.toBeInTheDocument();
    });

    it("calls onAnswerChange when user interacts", async () => {
        const user = setupUser();
        const handleAnswerChange = jest.fn();

        render(
            <PsephosRenderer
                ballot={approvalBallot}
                onAnswerChange={handleAnswerChange}
            />,
        );

        const yesCheckbox = screen.getByRole("checkbox", {name: "Yes"});
        await user.click(yesCheckbox);

        expect(handleAnswerChange).toHaveBeenCalledWith(true);
    });
});
