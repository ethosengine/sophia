import type {Coord} from "../data-schema";

export type Coords = [Coord, Coord];

/**
 * The type of movable element in a grapher widget.
 * - PLOT: A simple plot that can be moved
 * - PARABOLA: A parabolic curve
 * - SINUSOID: A sinusoidal curve
 */
export type MovableType = "PLOT" | "PARABOLA" | "SINUSOID";

/**
 * A mathematical function that maps x values to y values.
 */
export type GraphFunction = (x: number) => number;

// Includes common properties for all function types and plotDefaults
type SharedGrapherType = {
    url: string;
    defaultCoords: Coords;
    getFunctionForCoeffs: (coeffs: ReadonlyArray<number>, x: number) => number;
    getEquationString: (coords: Coords, asymptote?: Coords) => string | null;
    areEqual: (
        coeffs1: ReadonlyArray<number>,
        coeffs2: ReadonlyArray<number>,
    ) => boolean;
    Movable: MovableType;
    getCoefficients: (
        coords: Coords,
        asymptote?: Coords,
    ) => ReadonlyArray<number> | undefined;
};

/**
 * Represents a graph instance from the graphing library.
 * The exact shape depends on the graphing library implementation.
 */
export type GraphInstance = unknown;

type AsymptoticGraphsType = {
    defaultAsymptote: Coords;
    extraCoordConstraint: (
        newCoord: Coord,
        oldCoord: Coord,
        coords: Coords,
        asymptote: Coords,
        graph: GraphInstance,
    ) => boolean | Coord;
    extraAsymptoteConstraint: (
        newCoord: Coord,
        oldCoord: Coord,
        coords: Coords,
        asymptote: Coords,
        graph: GraphInstance,
    ) => Coord;
    allowReflectOverAsymptote: boolean;
};

export type LinearType = SharedGrapherType & {
    getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {fn: GraphFunction};
};

export type QuadraticType = SharedGrapherType & {
    getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {
        a: number;
        b: number;
        c: number;
    };
};

export type SinusoidType = SharedGrapherType & {
    getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {
        a: number;
        b: number;
        c: number;
        d: number;
    };
};

export type TangentType = SharedGrapherType & {
    getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {fn: GraphFunction};
};

export type ExponentialType = SharedGrapherType &
    AsymptoticGraphsType & {
        getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {
            fn: GraphFunction;
        };
    };

export type LogarithmType = SharedGrapherType &
    AsymptoticGraphsType & {
        getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {
            fn: GraphFunction;
        };
    };

export type AbsoluteValueType = SharedGrapherType & {
    getPropsForCoeffs: (coeffs: ReadonlyArray<number>) => {fn: GraphFunction};
};
