import {
    getScoringStrategy,
    clearStrategyRegistry,
} from "@ethosengine/sophia-core";

import {
    GovernanceScoringStrategy,
    buildBallotEntries,
    getEmptyOptionIds,
} from "../governance-strategy";

import type {PsephosBallot, BallotUserInput} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeBallot = (
    mechanism: PsephosBallot["mechanism"],
    options: PsephosBallot["options"],
    config: PsephosBallot["config"] = {},
): PsephosBallot => ({
    id: "ballot-1",
    purpose: "governance",
    proposal: {
        id: "prop-1",
        title: "Test Proposal",
        description: "A test",
        proposalType: "advice",
    },
    options,
    mechanism,
    config,
    hygiene: {
        randomizeOrder: false,
        equalVisualWeight: true,
        requireReasoning: false,
        showResultsAfterVote: true,
        confirmBeforeSubmit: false,
        hideVoterCount: true,
    },
});

const twoOptions: PsephosBallot["options"] = [
    {id: "opt-a", label: "Option A", description: "First", position: 0},
    {id: "opt-b", label: "Option B", description: "Second", position: 1},
];

const threeOptions: PsephosBallot["options"] = [
    ...twoOptions,
    {id: "opt-c", label: "Option C", description: "Third", position: 2},
];

// ─────────────────────────────────────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────────────────────────────────────

describe("GovernanceScoringStrategy registration", () => {
    beforeEach(() => {
        clearStrategyRegistry();
    });

    it("registers as 'governance' in the scoring registry on import", async () => {
        // Importing index.ts triggers auto-registration
        await import("../index");

        const strategy = getScoringStrategy("governance");
        expect(strategy).toBeDefined();
        expect(strategy?.id).toBe("governance");
        expect(strategy?.name).toBe("Governance Ballot");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getEmptyOptionIds — approval
// ─────────────────────────────────────────────────────────────────────────────

describe("getEmptyOptionIds — approval", () => {
    const ballot = makeBallot("approval", twoOptions);

    it("returns all option IDs when nothing is approved", () => {
        const userInput: BallotUserInput = {};
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([
            "opt-a",
            "opt-b",
        ]);
    });

    it("returns [] when at least one option is approved", () => {
        const userInput: BallotUserInput = {
            "opt-a": {approved: true},
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([]);
    });

    it("returns all IDs when options exist but none approved", () => {
        const userInput: BallotUserInput = {
            "opt-a": {approved: false},
            "opt-b": {approved: false},
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([
            "opt-a",
            "opt-b",
        ]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getEmptyOptionIds — score-vote
// ─────────────────────────────────────────────────────────────────────────────

describe("getEmptyOptionIds — score-vote", () => {
    const ballot = makeBallot("score-vote", threeOptions, {
        scoreMin: 0,
        scoreMax: 5,
    });

    it("returns unscored option IDs", () => {
        const userInput: BallotUserInput = {
            "opt-a": {score: 3},
            // opt-b and opt-c not scored
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([
            "opt-b",
            "opt-c",
        ]);
    });

    it("returns [] when all options are scored", () => {
        const userInput: BallotUserInput = {
            "opt-a": {score: 3},
            "opt-b": {score: 1},
            "opt-c": {score: 5},
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([]);
    });

    it("returns all IDs when nothing is scored", () => {
        const userInput: BallotUserInput = {};
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([
            "opt-a",
            "opt-b",
            "opt-c",
        ]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getEmptyOptionIds — dot-vote
// ─────────────────────────────────────────────────────────────────────────────

describe("getEmptyOptionIds — dot-vote", () => {
    const ballot = makeBallot("dot-vote", twoOptions, {dotsPerVoter: 10});

    it("always returns [] — zero allocation is valid", () => {
        expect(getEmptyOptionIds(ballot, {})).toEqual([]);
    });

    it("returns [] even with explicit zero dots", () => {
        const userInput: BallotUserInput = {
            "opt-a": {dots: 0},
            "opt-b": {dots: 0},
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getEmptyOptionIds — ranked-choice
// ─────────────────────────────────────────────────────────────────────────────

describe("getEmptyOptionIds — ranked-choice", () => {
    const ballot = makeBallot("ranked-choice", threeOptions);

    it("returns all IDs when nothing is ranked", () => {
        const userInput: BallotUserInput = {};
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([
            "opt-a",
            "opt-b",
            "opt-c",
        ]);
    });

    it("returns [] when at least one option is ranked", () => {
        const userInput: BallotUserInput = {
            "opt-b": {rank: 1},
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getEmptyOptionIds — consent
// ─────────────────────────────────────────────────────────────────────────────

describe("getEmptyOptionIds — consent", () => {
    const ballot = makeBallot("consent", twoOptions);

    it("returns all IDs when no choice made", () => {
        expect(getEmptyOptionIds(ballot, {})).toEqual(["opt-a", "opt-b"]);
    });

    it("returns [] when a choice is made (even blocking)", () => {
        const userInput: BallotUserInput = {
            "opt-a": {approved: false},
        };
        expect(getEmptyOptionIds(ballot, userInput)).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// buildBallotEntries
// ─────────────────────────────────────────────────────────────────────────────

describe("buildBallotEntries", () => {
    it("builds ranked-choice entries with rank field only", () => {
        const ballot = makeBallot("ranked-choice", twoOptions);
        const userInput: BallotUserInput = {
            "opt-a": {rank: 2},
            "opt-b": {rank: 1},
        };
        const entries = buildBallotEntries(ballot, userInput);
        expect(entries).toEqual([
            {optionId: "opt-a", rank: 2},
            {optionId: "opt-b", rank: 1},
        ]);
    });

    it("builds approval entries with approved field only", () => {
        const ballot = makeBallot("approval", twoOptions);
        const userInput: BallotUserInput = {
            "opt-a": {approved: true},
            "opt-b": {approved: false},
        };
        const entries = buildBallotEntries(ballot, userInput);
        expect(entries).toEqual([
            {optionId: "opt-a", approved: true},
            {optionId: "opt-b", approved: false},
        ]);
    });

    it("builds score-vote entries with score field only", () => {
        const ballot = makeBallot("score-vote", twoOptions);
        const userInput: BallotUserInput = {
            "opt-a": {score: 4},
        };
        const entries = buildBallotEntries(ballot, userInput);
        expect(entries).toEqual([
            {optionId: "opt-a", score: 4},
            {optionId: "opt-b", score: null},
        ]);
    });

    it("builds dot-vote entries with dots field only", () => {
        const ballot = makeBallot("dot-vote", twoOptions);
        const userInput: BallotUserInput = {
            "opt-a": {dots: 7},
            "opt-b": {dots: 3},
        };
        const entries = buildBallotEntries(ballot, userInput);
        expect(entries).toEqual([
            {optionId: "opt-a", dots: 7},
            {optionId: "opt-b", dots: 3},
        ]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// recognize
// ─────────────────────────────────────────────────────────────────────────────

describe("GovernanceScoringStrategy.recognize", () => {
    it("produces Recognition with governance result", () => {
        const ballot = makeBallot("approval", twoOptions);
        const userInput: BallotUserInput = {
            "opt-a": {approved: true},
            "opt-b": {approved: false},
            reasoning: "I prefer option A because it is better.",
        };

        const moment = {
            id: "moment-1",
            purpose: "governance" as const,
            content: ballot as any,
        };

        const recognition = GovernanceScoringStrategy.recognize(
            moment,
            userInput as any,
            "en",
        );

        expect(recognition.momentId).toBe("moment-1");
        expect(recognition.purpose).toBe("governance");
        expect(recognition.timestamp).toBeDefined();
        expect(recognition.governance).toBeDefined();

        const gov = recognition.governance!;
        expect(gov.mechanism).toBe("approval");
        expect(gov.proposalId).toBe("prop-1");
        expect(gov.reasoning).toBe("I prefer option A because it is better.");
        expect(gov.timestamp).toBeDefined();
        expect(gov.ballots).toHaveLength(2);
        expect(gov.ballots[0]).toEqual({
            optionId: "opt-a",
            approved: true,
        });
        expect(gov.ballots[1]).toEqual({
            optionId: "opt-b",
            approved: false,
        });
    });

    it("omits reasoning when not provided", () => {
        const ballot = makeBallot("dot-vote", twoOptions);
        const userInput: BallotUserInput = {
            "opt-a": {dots: 5},
            "opt-b": {dots: 5},
        };

        const moment = {
            id: "moment-2",
            purpose: "governance" as const,
            content: ballot as any,
        };

        const recognition = GovernanceScoringStrategy.recognize(
            moment,
            userInput as any,
            "en",
        );

        expect(recognition.governance!.reasoning).toBeUndefined();
    });
});
