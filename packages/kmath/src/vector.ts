/**
 * Vector Utils
 * A vector is an array of numbers e.g. [0, 3, 4].
 */

import * as knumber from "./number";

type Vector = ReadonlyArray<number>;

/** 2D point/vector represented as [x, y] */
type Point2D = [number, number];

function arraySum(array: ReadonlyArray<number>): number {
    return array.reduce((memo, arg) => memo + arg, 0);
}

function arrayProduct(array: ReadonlyArray<number>): number {
    return array.reduce((memo, arg) => memo * arg, 1);
}

export function zip<T>(xs: ReadonlyArray<T>, ys: ReadonlyArray<T>): [T, T][];
export function zip<T>(...arrays: ReadonlyArray<T>[]): T[][];
export function zip<T>(...arrays: ReadonlyArray<T>[]): T[][] {
    const n = Math.min(...arrays.map((a) => a.length));
    const results: T[][] = [];
    for (let i = 0; i < n; i++) {
        results.push(arrays.map((a) => a[i]));
    }
    return results;
}

export function map<T, U>(pair: [T, T], f: (a: T, i: number) => U): [U, U] {
    return [f(pair[0], 0), f(pair[1], 1)];
}

/**
 * Checks if the given vector contains only numbers and, optionally, is of the
 * right dimension (length).
 *
 * is([1, 2, 3]) -> true
 * is([1, "Hello", 3]) -> false
 * is([1, 2, 3], 1) -> false
 */
export function is(vec: unknown, dimension: 2): vec is [number, number];
export function is(vec: unknown, dimension?: number): vec is Vector;
export function is(vec: unknown, dimension?: number) {
    if (!Array.isArray(vec)) {
        return false;
    }
    if (dimension !== undefined && vec.length !== dimension) {
        return false;
    }
    return vec.every(knumber.is);
}

// Normalize to a unit vector
export function normalize<V extends Vector>(v: V): V {
    return scale(v, 1 / length(v));
}

// Length/magnitude of a vector
export function length(v: Vector): number {
    return Math.sqrt(dot(v, v));
}
// Dot product of two vectors
export function dot(a: Vector, b: Vector): number {
    const zipped = zip(a, b);
    const multiplied = zipped.map(arrayProduct);
    return arraySum(multiplied);
}

/* vector-add multiple [x, y] coords/vectors
 *
 * add([1, 2], [3, 4]) -> [4, 6]
 */
export function add<V extends Vector>(...vecs: ReadonlyArray<V>): V {
    const zipped = zip(...vecs);
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return zipped.map(arraySum);
}

export function subtract<V extends Vector>(v1: V, v2: V): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return zip(v1, v2).map((dim) => dim[0] - dim[1]);
}

export function negate<V extends Vector>(v: V): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return v.map((x) => {
        return -x;
    });
}

// Scale a vector
export function scale<V extends Vector>(v1: V, scalar: number): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return v1.map((x) => {
        return x * scalar;
    });
}

export function equal(v1: Vector, v2: Vector, tolerance?: number): boolean {
    return (
        v1.length === v2.length &&
        zip(v1, v2).every((pair) => knumber.equal(pair[0], pair[1], tolerance))
    );
}

export function codirectional(
    v1: Vector,
    v2: Vector,
    tolerance?: number,
): boolean {
    // The origin is trivially codirectional with all other vectors.
    // This gives nice semantics for codirectionality between points when
    // comparing their difference vectors.
    if (
        knumber.equal(length(v1), 0, tolerance) ||
        knumber.equal(length(v2), 0, tolerance)
    ) {
        return true;
    }

    v1 = normalize(v1);
    v2 = normalize(v2);

    return equal(v1, v2, tolerance);
}

export function collinear(v1: Vector, v2: Vector, tolerance?: number): boolean {
    return (
        codirectional(v1, v2, tolerance) ||
        codirectional(v1, negate(v2), tolerance)
    );
}

// These coordinate conversion functions handle 2D points [x, y]

/**
 * Convert a cartesian coordinate into a radian polar coordinate.
 * Returns [radius, theta] where theta is in range [0, 2pi].
 */
export function polarRadFromCart(v: ReadonlyArray<number>): Point2D {
    const radius = length(v);
    let theta = Math.atan2(v[1], v[0]);

    // Convert angle range from [-pi, pi] to [0, 2pi]
    if (theta < 0) {
        theta += 2 * Math.PI;
    }

    return [radius, theta];
}

/**
 * Converts a cartesian coordinate into a degree polar coordinate.
 * Returns [radius, theta] where theta is in degrees.
 */
export function polarDegFromCart(v: ReadonlyArray<number>): Point2D {
    const polar = polarRadFromCart(v);
    return [polar[0], (polar[1] * 180) / Math.PI];
}

/**
 * Convert a polar coordinate into a cartesian coordinate.
 *
 * @param radius - the distance from origin
 * @param theta - the angle in radians (default: 0)
 * @returns [x, y] cartesian coordinates
 *
 * @example cartFromPolarRad(5, Math.PI) // returns [-5, 0]
 */
export function cartFromPolarRad(radius: number, theta = 0): Point2D {
    return [radius * Math.cos(theta), radius * Math.sin(theta)];
}

/**
 * Convert a polar coordinate (in degrees) into a cartesian coordinate.
 *
 * @param radius - the distance from origin
 * @param theta - the angle in degrees (default: 0)
 * @returns [x, y] cartesian coordinates
 *
 * @example cartFromPolarDeg(5, 30)
 */
export function cartFromPolarDeg(radius: number, theta = 0): Point2D {
    return cartFromPolarRad(radius, (theta * Math.PI) / 180);
}

/**
 * Rotate a 2D vector by theta radians.
 */
export function rotateRad(v: ReadonlyArray<number>, theta: number): Point2D {
    const polar = polarRadFromCart(v);
    const angle = polar[1] + theta;
    return cartFromPolarRad(polar[0], angle);
}

/**
 * Rotate a 2D vector by theta degrees.
 */
export function rotateDeg(v: ReadonlyArray<number>, theta: number): Point2D {
    const polar = polarDegFromCart(v);
    const angle = polar[1] + theta;
    return cartFromPolarDeg(polar[0], angle);
}

// Angle between two vectors
export function angleRad(v1: Vector, v2: Vector): number {
    return Math.acos(dot(v1, v2) / (length(v1) * length(v2)));
}

export function angleDeg(v1: Vector, v2: Vector): number {
    return (angleRad(v1, v2) * 180) / Math.PI;
}

// Vector projection of v1 onto v2
export function projection<V extends Vector>(v1: V, v2: V): V {
    const scalar = dot(v1, v2) / dot(v2, v2);
    return scale(v2, scalar);
}

// Round each number to a certain number of decimal places
export function round<V extends Vector>(vec: V, precision: V | number): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return vec.map((elem, i) => knumber.round(elem, precision[i] || precision));
}

// Round each number to the nearest increment
export function roundTo(
    coord: [number, number],
    increment: [number, number] | number,
): [number, number];
export function roundTo<V extends Vector>(vec: V, increment: V | number): V;
export function roundTo<V extends Vector>(vec: V, increment: V | number): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return vec.map((elem, i) =>
        knumber.roundTo(elem, increment[i] || increment),
    );
}

export function floorTo<V extends Vector>(vec: V, increment: V | number): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return vec.map((elem, i) =>
        knumber.floorTo(elem, increment[i] || increment),
    );
}

export function ceilTo<V extends Vector>(vec: V, increment: V | number): V {
    // @ts-expect-error - TS2322 - Type 'number[]' is not assignable to type 'V'.
    return vec.map((elem, i) =>
        knumber.ceilTo(elem, increment[i] || increment),
    );
}
