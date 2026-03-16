/**
 * PsephosBallotElement
 *
 * A Web Component that wraps the Psephos governance ballot renderer.
 * Provides style encapsulation via Shadow DOM and easy integration
 * with any framework (Angular, Vue, vanilla JS).
 *
 * Unlike sophia-question (which uses Light DOM for Aphrodite CSS-in-JS
 * compatibility), psephos-ballot uses Shadow DOM since it has no
 * Aphrodite dependency.
 */

import {PsephosRenderer} from "@ethosengine/psephos";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

import type {PsephosBallot} from "@ethosengine/psephos";
import type {Recognition} from "@ethosengine/sophia-core";

/**
 * <psephos-ballot> Web Component
 *
 * Renders governance ballots with Shadow DOM encapsulation.
 *
 * @example
 * ```html
 * <psephos-ballot id="b1"></psephos-ballot>
 * <script>
 *   const el = document.getElementById('b1');
 *   el.ballot = {
 *     id: 'ballot-1',
 *     proposal: { title: 'Motion A', body: '...' },
 *     options: [...],
 *     config: { mechanism: 'approval', maxSelections: 3 },
 *     hygiene: { randomizeOrder: true, equalVisualWeight: true }
 *   };
 *   el.onRecognition = (recognition) => {
 *     console.log('Recognition:', recognition);
 *   };
 * </script>
 * ```
 */
export class PsephosBallotElement extends HTMLElement {
    // Private state
    private _ballot: PsephosBallot | null = null;
    private _reviewMode = false;
    private _lastRecognition: Recognition | null = null;

    // Callbacks
    private _onRecognition: ((recognition: Recognition) => void) | null = null;
    private _onAnswerChange: ((hasAnswer: boolean) => void) | null = null;

    // React internals
    private root: ReactDOM.Root | null = null;
    private container: HTMLDivElement | null = null;

    connectedCallback(): void {
        const shadow = this.attachShadow({mode: "open"});
        this.container = document.createElement("div");
        this.container.className = "psephos-root";
        shadow.appendChild(this.container);
        this.root = ReactDOM.createRoot(this.container);
        this.render();
    }

    disconnectedCallback(): void {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public Properties
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * The ballot to render.
     */
    get ballot(): PsephosBallot | null {
        return this._ballot;
    }

    set ballot(value: PsephosBallot | null) {
        this._ballot = value;
        this._lastRecognition = null;
        this.render();
    }

    /**
     * Whether to display in review mode (non-interactive, shows results).
     */
    get reviewMode(): boolean {
        return this._reviewMode;
    }

    set reviewMode(value: boolean) {
        this._reviewMode = value;
        this.render();
    }

    /**
     * Callback fired when a recognition is produced.
     */
    get onRecognition(): ((recognition: Recognition) => void) | null {
        return this._onRecognition;
    }

    set onRecognition(value: ((recognition: Recognition) => void) | null) {
        this._onRecognition = value;
    }

    /**
     * Callback fired when the answer state changes (ballot has/lacks selections).
     */
    get onAnswerChange(): ((hasAnswer: boolean) => void) | null {
        return this._onAnswerChange;
    }

    set onAnswerChange(value: ((hasAnswer: boolean) => void) | null) {
        this._onAnswerChange = value;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the last Recognition result (pull API).
     * Returns null if no ballot loaded or no interaction yet.
     */
    getRecognition(): Recognition | null {
        return this._lastRecognition;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────────────────

    private handleRecognition = (recognition: Recognition): void => {
        this._lastRecognition = recognition;
        this._onRecognition?.(recognition);
        this.dispatchEvent(
            new CustomEvent("recognition", {
                detail: recognition,
                bubbles: true,
                composed: true,
            }),
        );
    };

    private handleAnswerChange = (hasAnswer: boolean): void => {
        this._onAnswerChange?.(hasAnswer);
    };

    private render(): void {
        if (!this.root) {
            return;
        }

        if (!this._ballot) {
            this.root.render(null);
            return;
        }

        this.root.render(
            <PsephosRenderer
                ballot={this._ballot}
                onRecognition={this.handleRecognition}
                onAnswerChange={this.handleAnswerChange}
                reviewMode={this._reviewMode}
            />,
        );
    }
}

// Export for registration
export default PsephosBallotElement;
