import {getFeatureFlags} from "./feature-flags-util";

describe("getFeatureFlags", () => {
    it("returns default flags when no overrides are provided", () => {
        const flags = getFeatureFlags();
        // Default flags for testing are defined in feature-flags-util.ts
        expect(Object.keys(flags).length).toBe(3);
        expect(flags["new-radio-widget"]).toBe(false);
        expect(flags["image-widget-upgrade"]).toBe(false);
        expect(flags["image-widget-upgrade-alignment"]).toBe(false);
    });

    it("can add custom flags via overrides", () => {
        const flags = getFeatureFlags({"custom-flag": true});
        expect(flags["custom-flag"]).toBe(true);
    });

    it("handles multiple custom flags", () => {
        const flags = getFeatureFlags({
            "flag-one": true,
            "flag-two": false,
        });
        expect(flags["flag-one"]).toBe(true);
        expect(flags["flag-two"]).toBe(false);
    });
});
