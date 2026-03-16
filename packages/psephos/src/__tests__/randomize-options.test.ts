import {randomizeOptions} from "../hygiene/randomize-options";

describe("randomizeOptions", () => {
    const items = ["A", "B", "C", "D", "E"];

    it("same seed produces the same order", () => {
        const a = randomizeOptions(items, "voter-42::proposal-7");
        const b = randomizeOptions(items, "voter-42::proposal-7");
        expect(a).toEqual(b);
    });

    it("different seeds produce different orders", () => {
        const a = randomizeOptions(items, "seed-alpha");
        const b = randomizeOptions(items, "seed-beta");
        // With 5 items there are 120 permutations; the probability of a
        // collision is < 1%. We assert they differ.
        expect(a).not.toEqual(b);
    });

    it("no seed produces a shuffle (not always identical to input)", () => {
        // Mock Date.now() to return distinct values so each call gets a
        // different time-based seed.
        let tick = 1000000;
        const spy = jest.spyOn(Date, "now").mockImplementation(() => tick++);

        const results = Array.from({length: 20}, () => randomizeOptions(items));
        const allIdentical = results.every(
            (r) => r.join(",") === items.join(","),
        );
        // Probability of 20 identity shuffles on 5 items is (1/120)^20 ~ 0
        expect(allIdentical).toBe(false);

        spy.mockRestore();
    });

    it("all items appear exactly once (no duplicates, no missing)", () => {
        const result = randomizeOptions(items, "integrity-check");
        expect(result.sort()).toEqual([...items].sort());
    });

    it("does not mutate the original array", () => {
        const original = [...items];
        randomizeOptions(items, "mutation-test");
        expect(items).toEqual(original);
    });

    it("empty array returns empty array", () => {
        expect(randomizeOptions([], "empty")).toEqual([]);
    });

    it("single-item array returns that item", () => {
        expect(randomizeOptions(["X"], "solo")).toEqual(["X"]);
    });
});
