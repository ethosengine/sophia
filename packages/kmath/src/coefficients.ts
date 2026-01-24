import type {SineCoefficient} from "./geometry";
import type {Coord} from "@ethosengine/perseus-core";

export type NamedSineCoefficient = {
    amplitude: number;
    angularFrequency: number;
    phase: number;
    verticalOffset: number;
};

/**
 * Calculate sinusoid coefficients from two control points.
 * Returns a tuple [amplitude, angularFrequency, phase, verticalOffset].
 *
 * Note: There is a similar function in interactive-graphs/graphs/sinusoid.tsx
 * that returns a named object instead of a tuple. Both are kept intentionally
 * as they serve different API needs (tuple for math operations, object for readability).
 */
export function getSinusoidCoefficients(
    coords: ReadonlyArray<Coord>,
): SineCoefficient | undefined {
    // It's assumed that p1 is the root and p2 is the first peak
    const p1 = coords[0];
    const p2 = coords[1];

    // If the x-coordinates are the same, we cannot calculate the coefficients
    if (p2[0] === p1[0]) {
        return undefined;
    }

    // Resulting coefficients are canonical for this sine curve
    const amplitude = p2[1] - p1[1];
    const angularFrequency = Math.PI / (2 * (p2[0] - p1[0]));
    const phase = p1[0] * angularFrequency;
    const verticalOffset = p1[1];

    return [amplitude, angularFrequency, phase, verticalOffset];
}

export type QuadraticCoefficient = [number, number, number];

/**
 * Calculate quadratic coefficients [a, b, c] from three control points.
 * Returns undefined if the points are collinear (denominator is 0).
 *
 * Note: There is a similar function in interactive-graphs/graphs/quadratic.tsx
 * with stricter input typing (QuadraticCoords = [Coord, Coord, Coord]).
 * Both are kept as they serve different API needs.
 */
export function getQuadraticCoefficients(
    coords: ReadonlyArray<Coord>,
): QuadraticCoefficient | undefined {
    const p1 = coords[0];
    const p2 = coords[1];
    const p3 = coords[2];

    const denom = (p1[0] - p2[0]) * (p1[0] - p3[0]) * (p2[0] - p3[0]);
    if (denom === 0) {
        // Points are collinear or coincident - cannot determine quadratic
        return undefined;
    }
    const a =
        (p3[0] * (p2[1] - p1[1]) +
            p2[0] * (p1[1] - p3[1]) +
            p1[0] * (p3[1] - p2[1])) /
        denom;
    const b =
        (p3[0] * p3[0] * (p1[1] - p2[1]) +
            p2[0] * p2[0] * (p3[1] - p1[1]) +
            p1[0] * p1[0] * (p2[1] - p3[1])) /
        denom;
    const c =
        (p2[0] * p3[0] * (p2[0] - p3[0]) * p1[1] +
            p3[0] * p1[0] * (p3[0] - p1[0]) * p2[1] +
            p1[0] * p2[0] * (p1[0] - p2[0]) * p3[1]) /
        denom;
    return [a, b, c];
}
