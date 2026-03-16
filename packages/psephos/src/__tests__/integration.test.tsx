/**
 * Integration tests — election hygiene features through PsephosRenderer
 *
 * Tests randomization and confirmation step as they flow through the
 * full renderer, not re-testing widget internals.
 */
import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import * as React from "react";

import {DEFAULT_HYGIENE, PsephosRenderer} from "../index";

import type {PsephosBallot} from "../index";
import type {Recognition} from "@ethosengine/sophia-core";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const baseOptions = [
    {id: "opt-a", label: "Alpha", description: "", position: 0},
    {id: "opt-b", label: "Bravo", description: "", position: 1},
    {id: "opt-c", label: "Charlie", description: "", position: 2},
    {id: "opt-d", label: "Delta", description: "", position: 3},
];

function makeBallot(overrides: Partial<PsephosBallot> = {}): PsephosBallot {
    return {
        id: "ballot-integ",
        purpose: "governance",
        proposal: {
            id: "prop-integ",
            title: "Integration Proposal",
            description: "Testing the full flow",
            proposalType: "advice",
        },
        options: baseOptions,
        mechanism: "approval",
        config: {},
        hygiene: {...DEFAULT_HYGIENE.approval, randomizeOrder: false},
        ...overrides,
    };
}

function setupUser() {
    return userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Approval end-to-end
// ─────────────────────────────────────────────────────────────────────────────

describe("Approval end-to-end", () => {
    it("select options -> submit -> verify Recognition", async () => {
        const user = setupUser();
        const onRecognition = jest.fn();
        const ballot = makeBallot();

        render(
            <PsephosRenderer ballot={ballot} onRecognition={onRecognition} />,
        );

        // Select Alpha and Charlie
        await user.click(screen.getByRole("checkbox", {name: "Alpha"}));
        await user.click(screen.getByRole("checkbox", {name: "Charlie"}));

        // Submit
        await user.click(screen.getByRole("button", {name: "Submit ballot"}));

        expect(onRecognition).toHaveBeenCalledTimes(1);
        const recognition: Recognition = onRecognition.mock.calls[0][0];
        expect(recognition.purpose).toBe("governance");
        expect(recognition.governance!.mechanism).toBe("approval");
        expect(recognition.governance!.ballots).toEqual([
            {optionId: "opt-a", approved: true},
            {optionId: "opt-b", approved: null},
            {optionId: "opt-c", approved: true},
            {optionId: "opt-d", approved: null},
        ]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ranked-choice end-to-end
// ─────────────────────────────────────────────────────────────────────────────

describe("Ranked-choice end-to-end", () => {
    it("rank options -> submit -> verify Recognition", async () => {
        const user = setupUser();
        const onRecognition = jest.fn();
        const ballot = makeBallot({
            mechanism: "ranked-choice",
            hygiene: {
                ...DEFAULT_HYGIENE["ranked-choice"],
                randomizeOrder: false,
                confirmBeforeSubmit: false,
            },
        });

        render(
            <PsephosRenderer ballot={ballot} onRecognition={onRecognition} />,
        );

        // Rank Charlie first, then Alpha
        await user.click(screen.getByRole("button", {name: "Rank Charlie"}));
        await user.click(screen.getByRole("button", {name: "Rank Alpha"}));

        // Submit
        await user.click(screen.getByRole("button", {name: "Submit ballot"}));

        expect(onRecognition).toHaveBeenCalledTimes(1);
        const recognition: Recognition = onRecognition.mock.calls[0][0];
        expect(recognition.governance!.mechanism).toBe("ranked-choice");
        expect(recognition.governance!.ballots).toEqual(
            expect.arrayContaining([
                {optionId: "opt-c", rank: 1},
                {optionId: "opt-a", rank: 2},
                {optionId: "opt-b", rank: null},
                {optionId: "opt-d", rank: null},
            ]),
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation step integration
// ─────────────────────────────────────────────────────────────────────────────

describe("Confirmation step integration", () => {
    it("shows confirmation before firing Recognition", async () => {
        const user = setupUser();
        const onRecognition = jest.fn();
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: false,
                confirmBeforeSubmit: true,
            },
        });

        render(
            <PsephosRenderer ballot={ballot} onRecognition={onRecognition} />,
        );

        // Select an option
        await user.click(screen.getByRole("checkbox", {name: "Alpha"}));

        // Submit — should show confirmation, not fire recognition
        await user.click(screen.getByRole("button", {name: "Submit ballot"}));

        expect(onRecognition).not.toHaveBeenCalled();
        expect(screen.getByText("Review your ballot")).toBeInTheDocument();
        expect(screen.getByText(/You approved: Alpha/)).toBeInTheDocument();
    });

    it("fires Recognition after confirming", async () => {
        const user = setupUser();
        const onRecognition = jest.fn();
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: false,
                confirmBeforeSubmit: true,
            },
        });

        render(
            <PsephosRenderer ballot={ballot} onRecognition={onRecognition} />,
        );

        // Select and submit
        await user.click(screen.getByRole("checkbox", {name: "Alpha"}));
        await user.click(screen.getByRole("button", {name: "Submit ballot"}));

        // Confirm
        await user.click(screen.getByText("Confirm"));

        expect(onRecognition).toHaveBeenCalledTimes(1);
        expect(onRecognition.mock.calls[0][0].governance.mechanism).toBe(
            "approval",
        );
    });

    it("returns to ballot on Go Back", async () => {
        const user = setupUser();
        const onRecognition = jest.fn();
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: false,
                confirmBeforeSubmit: true,
            },
        });

        render(
            <PsephosRenderer ballot={ballot} onRecognition={onRecognition} />,
        );

        // Select and submit
        await user.click(screen.getByRole("checkbox", {name: "Alpha"}));
        await user.click(screen.getByRole("button", {name: "Submit ballot"}));

        // Go back
        await user.click(screen.getByText("Go Back"));

        expect(onRecognition).not.toHaveBeenCalled();
        // Should be back to ballot view
        expect(screen.getByText("Integration Proposal")).toBeInTheDocument();
        expect(
            screen.getByRole("button", {name: "Submit ballot"}),
        ).toBeInTheDocument();
    });

    it("skips confirmation when confirmBeforeSubmit is false", async () => {
        const user = setupUser();
        const onRecognition = jest.fn();
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: false,
                confirmBeforeSubmit: false,
            },
        });

        render(
            <PsephosRenderer ballot={ballot} onRecognition={onRecognition} />,
        );

        await user.click(screen.getByRole("checkbox", {name: "Alpha"}));
        await user.click(screen.getByRole("button", {name: "Submit ballot"}));

        // Recognition fires immediately — no confirmation step
        expect(onRecognition).toHaveBeenCalledTimes(1);
        expect(
            screen.queryByText("Review your ballot"),
        ).not.toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Randomization integration
// ─────────────────────────────────────────────────────────────────────────────

describe("Randomization integration", () => {
    it("renders options in shuffled order with seed", () => {
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: true,
                randomSeed: "test-seed-42",
            },
        });

        render(<PsephosRenderer ballot={ballot} />);

        // With seed "test-seed-42" and 4 options, Fisher-Yates produces:
        // Bravo, Delta, Alpha, Charlie
        const checkboxes = screen.getAllByRole("checkbox");
        const labels = checkboxes.map(
            (cb) => (cb as HTMLInputElement).labels?.[0]?.textContent ?? "",
        );

        expect(labels).toEqual(["Bravo", "Delta", "Alpha", "Charlie"]);
    });

    it("preserves original order when randomizeOrder is false", () => {
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: false,
            },
        });

        render(<PsephosRenderer ballot={ballot} />);

        const checkboxes = screen.getAllByRole("checkbox");
        const labels = checkboxes.map(
            (cb) => (cb as HTMLInputElement).labels?.[0]?.textContent ?? "",
        );

        expect(labels).toEqual(["Alpha", "Bravo", "Charlie", "Delta"]);
    });

    it("same seed always produces same order", () => {
        const ballot = makeBallot({
            hygiene: {
                ...DEFAULT_HYGIENE.approval,
                randomizeOrder: true,
                randomSeed: "deterministic-seed",
            },
        });

        const {unmount} = render(<PsephosRenderer ballot={ballot} />);
        const firstOrder = screen
            .getAllByRole("checkbox")
            .map(
                (cb) => (cb as HTMLInputElement).labels?.[0]?.textContent ?? "",
            );
        unmount();

        // Render again with same seed
        render(<PsephosRenderer ballot={ballot} />);
        const secondOrder = screen
            .getAllByRole("checkbox")
            .map(
                (cb) => (cb as HTMLInputElement).labels?.[0]?.textContent ?? "",
            );

        expect(firstOrder).toEqual(secondOrder);
    });
});
