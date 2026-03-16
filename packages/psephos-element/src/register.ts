/**
 * Custom Element Registration
 *
 * Handles registration of the <psephos-ballot> custom element.
 * Import this module to auto-register the element.
 */

import {PsephosBallotElement} from "./psephos-ballot";

/**
 * The custom element tag name.
 */
export const PSEPHOS_BALLOT_TAG = "psephos-ballot";

/**
 * Check if the psephos-ballot element is already registered.
 */
export function isPsephosElementRegistered(): boolean {
    if (typeof customElements === "undefined") {
        return false;
    }
    return customElements.get(PSEPHOS_BALLOT_TAG) !== undefined;
}

/**
 * Register the psephos-ballot custom element.
 *
 * This function is idempotent - calling it multiple times is safe.
 * The element will only be registered once.
 */
export function registerPsephosElement(): void {
    if (typeof customElements === "undefined") {
        return;
    }

    if (isPsephosElementRegistered()) {
        // Already registered, nothing to do
        return;
    }

    customElements.define(PSEPHOS_BALLOT_TAG, PsephosBallotElement);
}

// Auto-register on import
registerPsephosElement();
