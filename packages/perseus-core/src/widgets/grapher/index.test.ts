import invariant from "tiny-invariant";

import {
    generateGrapherGraph,
    generateGrapherWidgetOptions,
} from "../../utils/generators/grapher-widget-generator";

import type {PerseusGrapherWidgetOptions} from "../../data-schema";

import grapherWidgetLogic from "./index";

describe("grapherWidgetLogic.accessible()", () => {
    const accessibleFn = grapherWidgetLogic.accessible;
    invariant(accessibleFn instanceof Function);
    // This fork's WidgetLogicWithDefaults types `accessible` against the
    // broad PerseusWidgetOptions union, which does not include
    // PerseusGrapherWidgetOptions as a member (see grapher/index.ts).
    // Re-cast to the specific signature this test actually exercises.
    const accessible = accessibleFn as unknown as (
        options: PerseusGrapherWidgetOptions,
    ) => boolean;

    // A Grapher widget is accessible iff it has no background image and
    // a single non-quadratic function type.
    const accessibleGraph = generateGrapherWidgetOptions({
        graph: generateGrapherGraph({backgroundImage: {url: null}}),
        availableTypes: ["linear"],
    });

    it("returns true when the graph is accessible", () => {
        expect(accessible(accessibleGraph)).toBe(true);
    });

    it("returns false when the graph has a background image URL", () => {
        const graph = {
            ...accessibleGraph,
            graph: {
                ...accessibleGraph.graph,
                backgroundImage: {url: "something"},
            },
        };

        expect(accessible(graph)).toBe(false);
    });

    it("returns true when the graph has an empty background image URL", () => {
        const graph = {
            ...accessibleGraph,
            graph: {
                ...accessibleGraph.graph,
                backgroundImage: {url: ""},
            },
        };

        expect(accessible(graph)).toBe(true);
    });

    it("returns false when the graph is quadratic", () => {
        const graph: PerseusGrapherWidgetOptions = {
            ...accessibleGraph,
            availableTypes: ["quadratic"],
        };

        expect(accessible(graph)).toBe(false);
    });

    it("returns false when the graph has multiple available types (the choose-your-own-function case)", () => {
        const graph: PerseusGrapherWidgetOptions = {
            ...accessibleGraph,
            availableTypes: ["linear", "tangent"],
        };

        expect(accessible(graph)).toBe(false);
    });
});
