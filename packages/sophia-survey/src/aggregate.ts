/**
 * Resonance Aggregation
 *
 * Aggregates resonance results across multiple moments to reveal
 * the learner's overall affinities and recommend their path.
 */

import type {
    Recognition,
    AggregatedResonance,
    ResonanceResult,
} from "@ethosengine/sophia-core";

/**
 * Aggregate resonance across multiple discovery moments.
 *
 * This function combines the subscale contributions from all moments
 * to reveal the learner's overall affinities. The primary subscale
 * indicates their strongest resonance and suggests their recommended path.
 *
 * @param recognitions - Array of recognition results from discovery moments
 * @returns Aggregated resonance with totals and primary subscale
 */
export function aggregateResonance(
    recognitions: Recognition[],
): AggregatedResonance {
    const totals: Record<string, number> = {};
    let momentCount = 0;

    // Sum contributions across all moments
    for (const recognition of recognitions) {
        if (!recognition.resonance) continue;

        momentCount++;
        for (const [subscale, value] of Object.entries(
            recognition.resonance.subscaleContributions,
        )) {
            totals[subscale] = (totals[subscale] ?? 0) + value;
        }
    }

    // Find primary subscale (highest total)
    let primarySubscale = "";
    let maxValue = 0;
    for (const [subscale, value] of Object.entries(totals)) {
        if (value > maxValue) {
            maxValue = value;
            primarySubscale = subscale;
        }
    }

    // Calculate normalized scores (0-1)
    const normalizedScores = normalizeScores(totals);

    return {
        subscaleTotals: totals,
        primarySubscale,
        momentCount,
        normalizedScores,
    };
}

/**
 * Normalize subscale scores to a 0-1 range.
 * Useful for visualization and comparison.
 */
function normalizeScores(
    totals: Record<string, number>,
): Record<string, number> {
    const entries = Object.entries(totals);
    if (entries.length === 0) return {};

    const maxValue = Math.max(...entries.map(([, v]) => v));
    if (maxValue === 0) return {};

    const normalized: Record<string, number> = {};
    for (const [subscale, value] of entries) {
        normalized[subscale] = value / maxValue;
    }
    return normalized;
}

/**
 * Get subscale rankings from aggregated resonance.
 * Returns subscales ordered by total contribution (highest first).
 */
export function getSubscaleRankings(
    aggregated: AggregatedResonance,
): Array<{subscale: string; total: number; normalized: number}> {
    return Object.entries(aggregated.subscaleTotals)
        .map(([subscale, total]) => ({
            subscale,
            total,
            normalized: aggregated.normalizedScores?.[subscale] ?? 0,
        }))
        .sort((a, b) => b.total - a.total);
}

/**
 * Check if there's a clear primary subscale (significantly higher than others).
 * Uses a threshold to determine if the primary is meaningfully distinct.
 *
 * @param aggregated - Aggregated resonance result
 * @param threshold - Minimum difference ratio (default 0.2 = 20% higher)
 * @returns True if primary subscale is clearly dominant
 */
export function hasClearPrimary(
    aggregated: AggregatedResonance,
    threshold: number = 0.2,
): boolean {
    const rankings = getSubscaleRankings(aggregated);
    if (rankings.length < 2) return rankings.length === 1;

    const first = rankings[0].total;
    const second = rankings[1].total;

    if (first === 0) return false;
    return (first - second) / first >= threshold;
}

/**
 * Merge multiple aggregated resonance results.
 * Useful when combining results from different assessment sessions.
 */
export function mergeAggregatedResonance(
    results: AggregatedResonance[],
): AggregatedResonance {
    const totals: Record<string, number> = {};
    let momentCount = 0;

    for (const result of results) {
        momentCount += result.momentCount;
        for (const [subscale, value] of Object.entries(result.subscaleTotals)) {
            totals[subscale] = (totals[subscale] ?? 0) + value;
        }
    }

    // Recalculate primary and normalized scores
    let primarySubscale = "";
    let maxValue = 0;
    for (const [subscale, value] of Object.entries(totals)) {
        if (value > maxValue) {
            maxValue = value;
            primarySubscale = subscale;
        }
    }

    return {
        subscaleTotals: totals,
        primarySubscale,
        momentCount,
        normalizedScores: normalizeScores(totals),
    };
}

/**
 * Create an insight message based on aggregated resonance.
 * Returns a human-readable description of the learner's affinities.
 *
 * @param aggregated - Aggregated resonance result
 * @param subscaleLabels - Optional mapping of subscale IDs to display names
 */
export function createInsightMessage(
    aggregated: AggregatedResonance,
    subscaleLabels?: Record<string, string>,
): string {
    const rankings = getSubscaleRankings(aggregated);
    if (rankings.length === 0) {
        return "Complete more discovery moments to reveal your affinities.";
    }

    const getLabel = (subscale: string) =>
        subscaleLabels?.[subscale] ?? subscale;

    const primary = getLabel(rankings[0].subscale);

    if (rankings.length === 1) {
        return `Your responses resonate most strongly with ${primary}.`;
    }

    const second = getLabel(rankings[1].subscale);

    if (hasClearPrimary(aggregated)) {
        return `Your responses resonate most strongly with ${primary}, with secondary interest in ${second}.`;
    }

    return `Your responses show strong resonance with both ${primary} and ${second}.`;
}
