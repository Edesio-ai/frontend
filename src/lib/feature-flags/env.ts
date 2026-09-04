/**
 * UI panel for toggling feature flags manually.
 * Hidden on production builds; available in local development.
 *
 * Set NEXT_PUBLIC_ENABLE_FEATURE_FLAGS_PANEL=true on a non-prod deployment
 * (e.g. staging preview) if you need the panel outside `npm run dev`.
 *
 * LocalStorage overrides follow the same gate: they never apply in production
 * unless the panel is explicitly enabled.
 */
export function isFeatureFlagsPanelEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_ENABLE_FEATURE_FLAGS_PANEL === "true";
  }

  return true;
}

export function areFeatureFlagOverridesEnabled(): boolean {
  return isFeatureFlagsPanelEnabled();
}
