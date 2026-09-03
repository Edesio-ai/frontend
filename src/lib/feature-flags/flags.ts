export type FeatureFlagDefinition = {
  defaultEnabled: boolean;
};

/**
 * Registry of feature flags. Add new entries here, then wire labels in i18n
 * under `featureFlags.flags.<key>`.
 *
 * @example
 * export const FEATURE_FLAGS = {
 *   newTeacherDashboard: { defaultEnabled: false },
 * } as const satisfies Record<string, FeatureFlagDefinition>;
 */
export const FEATURE_FLAGS = {} as const satisfies Record<string, FeatureFlagDefinition>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS extends never ? string : keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAGS) as FeatureFlagKey[];

export function getFeatureFlagDefinition(key: string): FeatureFlagDefinition | undefined {
  return (FEATURE_FLAGS as Record<string, FeatureFlagDefinition>)[key];
}
