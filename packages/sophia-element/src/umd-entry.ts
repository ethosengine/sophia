/**
 * UMD Entry Point
 *
 * This entry point is used for building the UMD bundle that includes React.
 * It exposes React on the window for UMD consumers and auto-registers the element.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";

// Expose React and ReactDOM for UMD consumers
// This allows the bundle to be used without a separate React script
if (typeof window !== "undefined") {
    (window as any).React = React;
    (window as any).ReactDOM = ReactDOM;
}

// Auto-register the custom element
// eslint-disable-next-line import/no-unassigned-import
import "./register";

// Re-export everything from the main entry point
export * from "./index";

// Export React and ReactDOM for consumers that want explicit access
export {React, ReactDOM};
