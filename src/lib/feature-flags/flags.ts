export type FeatureFlagDefinition = {
  defaultEnabled: boolean;
  /**
   * Optional `NEXT_PUBLIC_FF_*` value. `"true"` / `"false"` override
   * `defaultEnabled` at build time (Next only inlines literal env names).
   */
  envValue?: string;
  /** When set, the flag is mirrored on `<html>` (e.g. CSS themes). */
  htmlAttribute?: string;
};

/**
 * Registry of feature flags. Add an entry here, then labels in i18n under
 * `featureFlags.flags.<key>`. Defaults are overridable via `envValue` and,
 * locally, via the feature-flags panel.
 */
export const FEATURE_FLAGS = {
  brandRefresh: {
    defaultEnabled: false,
    envValue: process.env.NEXT_PUBLIC_FF_BRAND_REFRESH,
    htmlAttribute: "data-brand-refresh",
  },
} as const satisfies Record<string, FeatureFlagDefinition>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAGS) as FeatureFlagKey[];

export function getFeatureFlagDefinition(key: string): FeatureFlagDefinition | undefined {
  return (FEATURE_FLAGS as Record<string, FeatureFlagDefinition>)[key];
}

export function isFeatureFlagOnByDefault(key: FeatureFlagKey): boolean {
  const definition = FEATURE_FLAGS[key] as FeatureFlagDefinition;
  if (definition.envValue === "true") {
    return true;
  }
  if (definition.envValue === "false") {
    return false;
  }
  return definition.defaultEnabled;
}
