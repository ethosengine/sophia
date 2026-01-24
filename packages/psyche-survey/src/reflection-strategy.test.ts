import {ReflectionScoringStrategy} from "./reflection-strategy";

import type {PerseusRenderer, UserInputMap} from "@ethosengine/perseus-core";
import type {Moment, SubscaleMappings} from "@ethosengine/sophia-core";

// Helper to create mock Perseus content (avoids strict typing issues in tests)
function mockContent(
    overrides: Partial<PerseusRenderer> = {},
): PerseusRenderer {
    return {
        content: "",
        images: {},
        widgets: {},
        ...overrides,
    } as PerseusRenderer;
}

// Helper to create mock user input
function mockInput(input: Record<string, unknown>): UserInputMap {
    return input as UserInputMap;
}

describe("ReflectionScoringStrategy", () => {
    describe("id and name", () => {
        it("has the correct id", () => {
            expect(ReflectionScoringStrategy.id).toBe("reflection");
        });

        it("has the correct name", () => {
            expect(ReflectionScoringStrategy.name).toBe("Reflection");
        });
    });

    describe("getEmptyWidgetIds", () => {
        it("returns empty array when content has no widgets", () => {
            const content = mockContent({content: "Some content"});
            const userInput = mockInput({});

            const result = ReflectionScoringStrategy.getEmptyWidgetIds(
                content,
                userInput,
                "en",
            );

            expect(result).toEqual([]);
        });

        it("returns widget ids with no input", () => {
            const content = mockContent({
                content: "Some content [[widget 1]]",
                widgets: {
                    "widget 1": {type: "radio", options: {}},
                } as PerseusRenderer["widgets"],
            });
            const userInput = mockInput({});

            const result = ReflectionScoringStrategy.getEmptyWidgetIds(
                content,
                userInput,
                "en",
            );

            expect(result).toEqual(["widget 1"]);
        });

        it("returns empty array when widget has input", () => {
            const content = mockContent({
                content: "Some content [[widget 1]]",
                widgets: {
                    "widget 1": {type: "radio", options: {}},
                } as PerseusRenderer["widgets"],
            });
            const userInput = mockInput({
                "widget 1": {choicesSelected: [true, false]},
            });

            const result = ReflectionScoringStrategy.getEmptyWidgetIds(
                content,
                userInput,
                "en",
            );

            expect(result).toEqual([]);
        });

        it("skips static widgets", () => {
            const content = mockContent({
                content: "Some content [[widget 1]]",
                widgets: {
                    "widget 1": {type: "radio", options: {}, static: true},
                } as PerseusRenderer["widgets"],
            });
            const userInput = mockInput({});

            const result = ReflectionScoringStrategy.getEmptyWidgetIds(
                content,
                userInput,
                "en",
            );

            expect(result).toEqual([]);
        });

        it("detects empty text content in free response widgets", () => {
            const content = mockContent({
                content: "Some content [[free-response 1]]",
                widgets: {
                    "free-response 1": {type: "free-response", options: {}},
                } as PerseusRenderer["widgets"],
            });
            const userInput = mockInput({
                "free-response 1": {content: "   "},
            });

            const result = ReflectionScoringStrategy.getEmptyWidgetIds(
                content,
                userInput,
                "en",
            );

            expect(result).toEqual(["free-response 1"]);
        });
    });

    describe("recognize", () => {
        it("produces reflection result for free response", () => {
            const moment: Moment = {
                id: "reflection-1",
                purpose: "reflection",
                content: mockContent({
                    content: "Describe your thoughts [[free-response 1]]",
                    widgets: {
                        "free-response 1": {type: "free-response", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
            };
            const userInput = mockInput({
                "free-response 1": {content: "My reflection text"},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.momentId).toBe("reflection-1");
            expect(recognition.purpose).toBe("reflection");
            expect(recognition.reflection).toBeDefined();
            expect(recognition.reflection?.textContent).toBe(
                "My reflection text",
            );
            expect(recognition.timestamp).toBeDefined();
        });

        it("extracts subscale contributions when defined", () => {
            const subscaleContributions: SubscaleMappings = {
                "radio 1": {
                    "choice-0": {openness: 1},
                    "choice-1": {conscientiousness: 1},
                },
            };
            const moment: Moment = {
                id: "reflection-2",
                purpose: "reflection",
                content: mockContent({
                    content: "Select one [[radio 1]]",
                    widgets: {
                        "radio 1": {type: "radio", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
                subscaleContributions,
            };
            const userInput = mockInput({
                "radio 1": {choicesSelected: [true, false]},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection).toBeDefined();
            expect(recognition.reflection?.subscaleContributions).toEqual({
                openness: 1,
            });
        });

        it("extracts multiple subscale contributions", () => {
            const subscaleContributions: SubscaleMappings = {
                "radio 1": {
                    "choice-0": {openness: 2, creativity: 1},
                    "choice-1": {conscientiousness: 1},
                },
            };
            const moment: Moment = {
                id: "reflection-3",
                purpose: "reflection",
                content: mockContent({
                    content: "Select one [[radio 1]]",
                    widgets: {
                        "radio 1": {type: "radio", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
                subscaleContributions,
            };
            const userInput = mockInput({
                "radio 1": {choicesSelected: [true, false]},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection?.subscaleContributions).toEqual({
                openness: 2,
                creativity: 1,
            });
        });

        it("handles dropdown widget subscale contributions", () => {
            const subscaleContributions: SubscaleMappings = {
                "dropdown 1": {
                    "choice-1": {preference: 3},
                    "choice-2": {aversion: 2},
                },
            };
            const moment: Moment = {
                id: "reflection-4",
                purpose: "reflection",
                content: mockContent({
                    content: "Select [[dropdown 1]]",
                    widgets: {
                        "dropdown 1": {type: "dropdown", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
                subscaleContributions,
            };
            const userInput = mockInput({
                "dropdown 1": {value: 1},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection?.subscaleContributions).toEqual({
                preference: 3,
            });
        });

        it("captures user input in reflection result", () => {
            const moment: Moment = {
                id: "reflection-5",
                purpose: "reflection",
                content: mockContent({content: "Share your thoughts"}),
            };
            const userInput = mockInput({
                "some-widget": {data: "test"},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection?.userInput).toEqual(userInput);
        });

        it("extracts text from input-number widgets", () => {
            const moment: Moment = {
                id: "reflection-6",
                purpose: "reflection",
                content: mockContent({
                    content: "Enter a number [[input-number 1]]",
                    widgets: {
                        "input-number 1": {type: "input-number", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
            };
            const userInput = mockInput({
                "input-number 1": {currentValue: "42"},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection?.textContent).toBe("42");
        });

        it("concatenates text from multiple widgets", () => {
            const moment: Moment = {
                id: "reflection-7",
                purpose: "reflection",
                content: mockContent({
                    content:
                        "First [[free-response 1]] Second [[free-response 2]]",
                    widgets: {
                        "free-response 1": {type: "free-response", options: {}},
                        "free-response 2": {type: "free-response", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
            };
            const userInput = mockInput({
                "free-response 1": {content: "First thought"},
                "free-response 2": {content: "Second thought"},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection?.textContent).toBe(
                "First thought\nSecond thought",
            );
        });

        it("returns undefined textContent when no text inputs", () => {
            const moment: Moment = {
                id: "reflection-8",
                purpose: "reflection",
                content: mockContent({
                    content: "Select [[radio 1]]",
                    widgets: {
                        "radio 1": {type: "radio", options: {}},
                    } as PerseusRenderer["widgets"],
                }),
            };
            const userInput = mockInput({
                "radio 1": {choicesSelected: [true]},
            });

            const recognition = ReflectionScoringStrategy.recognize(
                moment,
                userInput,
                "en",
            );

            expect(recognition.reflection?.textContent).toBeUndefined();
        });
    });
});
