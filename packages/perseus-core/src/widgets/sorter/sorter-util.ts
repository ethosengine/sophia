import {constrainedShuffle, type RNG, seededRNG} from "../../utils/random-util";

import type {PerseusSorterWidgetOptions} from "../../data-schema";

/**
 * For details on the individual options, see the
 * PerseusSorterWidgetOptions type
 */
export type SorterPublicWidgetOptions = {
    // Named `cards` (not `correct`) because these are shuffled/sorted,
    // not in the correct order. The original options.correct is obscured.
    cards: PerseusSorterWidgetOptions["correct"];
    padding: PerseusSorterWidgetOptions["padding"];
    layout: PerseusSorterWidgetOptions["layout"];
};

/**
 * Given a PerseusSorterWidgetOptions object, return a new object with only
 * the public options that should be exposed to the client.
 */
function getSorterPublicWidgetOptions(
    options: PerseusSorterWidgetOptions,
): SorterPublicWidgetOptions {
    return {
        padding: options.padding,
        layout: options.layout,
        // To remove information about the correct answer, we sort the cards.
        // However, we leave the first card in place so the client can avoid
        // showing the correct answer to the learner in the initial state of
        // the widget (since that could be confusing).
        cards: sortAllButFirst(options.correct),
    };
}

export function shuffleSorter(
    options: Pick<SorterPublicWidgetOptions, "cards">,
    problemNum: number,
): string[] {
    const {cards} = options;
    const rng = seededRNG(problemNum ?? 0);
    // See getSorterPublicWidgetOptions for an explanation of why we need to
    // displace the first card.
    return shuffleDisplacingFirst(cards, rng);
}

function sortAllButFirst([first, ...rest]: readonly string[]): string[] {
    return [first, ...rest.sort()];
}

function shuffleDisplacingFirst<T>(array: readonly T[], rng: RNG): T[] {
    function isFirstElementDisplaced(shuffled: readonly T[]) {
        return shuffled[0] !== array[0];
    }

    return constrainedShuffle(array, rng, isFirstElementDisplaced);
}

export default getSorterPublicWidgetOptions;
