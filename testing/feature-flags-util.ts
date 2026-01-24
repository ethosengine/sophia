/**
 * Default feature flags for testing.
 * Must include all flags defined in PerseusFeatureFlags (perseus-core/src/feature-flags.ts)
 */
const DEFAULT_FEATURE_FLAGS: Record<
    | "new-radio-widget"
    | "image-widget-upgrade"
    | "image-widget-upgrade-alignment",
    boolean
> = {
    "new-radio-widget": false,
    "image-widget-upgrade": false,
    "image-widget-upgrade-alignment": false,
};

/** Utility to get feature flags with optional overrides for testing.
 *  sample usage:
 *  getFeatureFlags({"my-feature-flag": true})
 */
export function getFeatureFlags(
    overrides: Partial<typeof DEFAULT_FEATURE_FLAGS> = {},
) {
    return {...DEFAULT_FEATURE_FLAGS, ...overrides};
}
