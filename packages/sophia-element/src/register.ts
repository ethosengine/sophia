/**
 * Custom Element Registration
 *
 * Handles registration of the <sophia-question> custom element.
 * Import this module to auto-register the element.
 */

import {logger} from "./sophia-config";
import {SophiaQuestionElement} from "./sophia-question";

/**
 * The custom element tag name.
 */
export const SOPHIA_QUESTION_TAG = "sophia-question";

/**
 * Check if the sophia-question element is already registered.
 */
export function isSophiaElementRegistered(): boolean {
    if (typeof customElements === "undefined") {
        return false;
    }
    return customElements.get(SOPHIA_QUESTION_TAG) !== undefined;
}

/**
 * Register the sophia-question custom element.
 *
 * This function is idempotent - calling it multiple times is safe.
 * The element will only be registered once.
 */
export function registerSophiaElement(): void {
    if (typeof customElements === "undefined") {
        logger.warn(
            "Custom elements API not available. " +
                "sophia-question cannot be registered.",
        );
        return;
    }

    if (isSophiaElementRegistered()) {
        // Already registered, nothing to do
        return;
    }

    customElements.define(SOPHIA_QUESTION_TAG, SophiaQuestionElement);
}

// Auto-register on import
registerSophiaElement();
