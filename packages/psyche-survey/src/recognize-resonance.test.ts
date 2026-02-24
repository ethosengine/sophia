import {
    recognizeResonance,
    getPrimarySubscale,
    hasResonance,
} from "./recognize-resonance";

import type {UserInputMap} from "@ethosengine/perseus-core";
import type {
    Moment,
    ResonanceResult,
    SubscaleMappings,
} from "@ethosengine/sophia-core";

// Helper to create mock user input
function mockInput(input: Record<string, unknown>): UserInputMap {
    return input as UserInputMap;
}

describe("recognizeResonance", () => {
    it("looks up contributions by full choice ID", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "str-q1-choice-0": {creativity: 1},
                "str-q1-choice-1": {creativity: 2},
                "str-q1-choice-2": {creativity: 3},
            },
        };
        const moment: Moment = {
            id: "str-q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: ["str-q1-choice-1"]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({
            creativity: 2,
        });
    });

    it("falls back to index extraction when data uses numeric keys", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {creativity: 1},
                "1": {creativity: 2},
                "2": {creativity: 3},
            },
        };
        const moment: Moment = {
            id: "str-q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: ["str-q1-choice-2"]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({
            creativity: 3,
        });
    });

    it("handles empty user input", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {creativity: 1},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({});

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({});
        expect(recognition.resonance?.selectedChoiceIds).toBeUndefined();
    });

    it("handles radio input with no selections", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {creativity: 1},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: []},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({});
    });

    it("accumulates contributions across multiple subscales", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {creativity: 2, curiosity: 1},
                "1": {creativity: 0, curiosity: 3},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: ["q1-choice-0"]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({
            creativity: 2,
            curiosity: 1,
        });
    });

    it("accumulates contributions across multiple widgets", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {openness: 3},
                "1": {openness: 1},
            },
            "radio 2": {
                "0": {openness: 2},
                "1": {openness: 4},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: ["q1-r1-choice-0"]},
            "radio 2": {selectedChoiceIds: ["q1-r2-choice-1"]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({
            openness: 7,
        });
    });

    it("handles old choicesSelected boolean array format", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "radio 1-choice-1": {kindness: 5},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {choicesSelected: [false, true, false]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({
            kindness: 5,
        });
    });

    it("skips widgets with no subscale mappings", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {creativity: 3},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: ["q1-choice-0"]},
            "radio 2": {selectedChoiceIds: ["q1-r2-choice-0"]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.subscaleContributions).toEqual({
            creativity: 3,
        });
    });

    it("sets correct momentId and purpose", () => {
        const moment: Moment = {
            id: "discovery-42",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
        };
        const userInput = mockInput({});

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.momentId).toBe("discovery-42");
        expect(recognition.purpose).toBe("discovery");
    });

    it("collects selectedChoiceIds in the result", () => {
        const subscaleContributions: SubscaleMappings = {
            "radio 1": {
                "0": {openness: 1},
            },
        };
        const moment: Moment = {
            id: "q1",
            purpose: "discovery",
            content: {content: "", images: {}, widgets: {}},
            subscaleContributions,
        };
        const userInput = mockInput({
            "radio 1": {selectedChoiceIds: ["q1-choice-0"]},
        });

        const recognition = recognizeResonance(moment, userInput);

        expect(recognition.resonance?.selectedChoiceIds).toEqual([
            "q1-choice-0",
        ]);
    });
});

describe("getPrimarySubscale", () => {
    it("returns the subscale with the highest contribution", () => {
        const resonance: ResonanceResult = {
            subscaleContributions: {
                creativity: 2,
                kindness: 5,
                curiosity: 3,
            },
        };

        expect(getPrimarySubscale(resonance)).toBe("kindness");
    });

    it("returns undefined for empty contributions", () => {
        const resonance: ResonanceResult = {
            subscaleContributions: {},
        };

        expect(getPrimarySubscale(resonance)).toBeUndefined();
    });

    it("returns the first subscale when tied", () => {
        const resonance: ResonanceResult = {
            subscaleContributions: {
                creativity: 3,
                kindness: 3,
            },
        };

        // When tied, returns the first one encountered
        expect(getPrimarySubscale(resonance)).toBe("creativity");
    });
});

describe("hasResonance", () => {
    it("returns true when recognition has subscale contributions", () => {
        const recognition = {
            momentId: "q1",
            purpose: "discovery" as const,
            userInput: {} as UserInputMap,
            resonance: {
                subscaleContributions: {creativity: 3},
            },
        };

        expect(hasResonance(recognition)).toBe(true);
    });

    it("returns false when resonance is undefined", () => {
        const recognition = {
            momentId: "q1",
            purpose: "discovery" as const,
            userInput: {} as UserInputMap,
        };

        expect(hasResonance(recognition)).toBe(false);
    });

    it("returns false when subscale contributions are empty", () => {
        const recognition = {
            momentId: "q1",
            purpose: "discovery" as const,
            userInput: {} as UserInputMap,
            resonance: {
                subscaleContributions: {},
            },
        };

        expect(hasResonance(recognition)).toBe(false);
    });
});
