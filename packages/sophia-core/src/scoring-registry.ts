/**
 * Scoring Strategy Registry
 *
 * A global registry for scoring strategies that allows packages to register
 * their strategies at import time, enabling dynamic strategy selection at runtime.
 *
 * @packageDocumentation
 */

import {NoOpScoringStrategy} from "./scoring-strategy";

import type {ScoringStrategy} from "./scoring-strategy";

// ─────────────────────────────────────────────────────────────────────────────
// Registry State
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Internal registry of scoring strategies.
 * Strategies register themselves at import time.
 */
const strategyRegistry = new Map<string, ScoringStrategy>();

/**
 * The default scoring strategy ID.
 * Can be changed via setDefaultScoringStrategy().
 */
let defaultStrategyId: string = "noop";

// Initialize with NoOpScoringStrategy
strategyRegistry.set(NoOpScoringStrategy.id, NoOpScoringStrategy);

// ─────────────────────────────────────────────────────────────────────────────
// Registry Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a scoring strategy.
 * Packages call this at import time to make their strategy available.
 *
 * @param strategy - The strategy to register
 * @throws Error if a strategy with the same ID is already registered
 *
 * @example
 * ```typescript
 * // In perseus-score/src/index.ts:
 * import { registerScoringStrategy } from '@ethosengine/sophia-core';
 * import { MasteryScoringStrategy } from './mastery-strategy';
 *
 * registerScoringStrategy(MasteryScoringStrategy);
 * ```
 */
export function registerScoringStrategy(strategy: ScoringStrategy): void {
    if (strategyRegistry.has(strategy.id)) {
        // eslint-disable-next-line no-console
        console.warn(
            `ScoringStrategy "${strategy.id}" is already registered. ` +
                `Overwriting with new registration.`,
        );
    }
    strategyRegistry.set(strategy.id, strategy);
}

/**
 * Get a scoring strategy by ID.
 *
 * @param id - The strategy ID
 * @returns The strategy, or undefined if not found
 */
export function getScoringStrategy(id: string): ScoringStrategy | undefined {
    return strategyRegistry.get(id);
}

/**
 * Get the default scoring strategy.
 * Returns NoOpScoringStrategy if no default has been set.
 */
export function getDefaultScoringStrategy(): ScoringStrategy {
    const strategy = strategyRegistry.get(defaultStrategyId);
    return strategy ?? NoOpScoringStrategy;
}

/**
 * Set the default scoring strategy.
 * Call this after registering your preferred strategy.
 *
 * @param id - The ID of the strategy to use as default
 * @throws Error if no strategy with that ID is registered
 *
 * @example
 * ```typescript
 * // In app initialization:
 * import '@ethosengine/perseus-score';  // Registers mastery
 * import { setDefaultScoringStrategy } from '@ethosengine/sophia-core';
 *
 * setDefaultScoringStrategy('mastery');
 * ```
 */
export function setDefaultScoringStrategy(id: string): void {
    if (!strategyRegistry.has(id)) {
        throw new Error(
            `[scoring-registry] Strategy not found: "${id}". ` +
                `Available: ${Array.from(strategyRegistry.keys()).join(", ")}`,
        );
    }
    defaultStrategyId = id;
}

/**
 * Get all registered strategy IDs.
 * Useful for debugging or building UI selectors.
 */
export function getRegisteredStrategyIds(): ReadonlyArray<string> {
    return Array.from(strategyRegistry.keys());
}

/**
 * Check if a strategy is registered.
 */
export function hasStrategy(id: string): boolean {
    return strategyRegistry.has(id);
}

/**
 * Clear the registry (for testing).
 * Re-registers NoOpScoringStrategy and resets default.
 */
export function clearStrategyRegistry(): void {
    strategyRegistry.clear();
    strategyRegistry.set(NoOpScoringStrategy.id, NoOpScoringStrategy);
    defaultStrategyId = "noop";
}
