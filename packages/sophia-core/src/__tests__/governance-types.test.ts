import {
    createGovernanceRecognition,
    hasGovernanceResult,
    hasMasteryResult,
    type GovernanceResult,
    type Recognition,
} from "../index";

describe("governance types", () => {
    const governance: GovernanceResult = {
        mechanism: "approval",
        ballots: [
            {optionId: "opt-1", approved: true},
            {optionId: "opt-2", approved: false},
        ],
        timestamp: "2026-03-15T10:00:00Z",
        proposalId: "prop-123",
    };

    it("createGovernanceRecognition produces valid Recognition", () => {
        const rec = createGovernanceRecognition("ballot-1", governance);
        expect(rec.purpose).toBe("governance");
        expect(rec.governance).toBe(governance);
        expect(rec.momentId).toBe("ballot-1");
    });

    it("hasGovernanceResult returns true for governance recognition", () => {
        const rec = createGovernanceRecognition("ballot-1", governance);
        expect(hasGovernanceResult(rec)).toBe(true);
        expect(hasMasteryResult(rec)).toBe(false);
    });

    it("hasGovernanceResult returns false for mastery recognition", () => {
        const rec: Recognition = {
            momentId: "m-1",
            purpose: "mastery",
            mastery: {demonstrated: true, score: 1, total: 1},
            userInput: {},
        };
        expect(hasGovernanceResult(rec)).toBe(false);
    });
});
