import type { FeatureFlagKey } from "./flags";

const STORAGE_KEY = "edesio-feature-flag-overrides";

export type FeatureFlagOverrides = Partial<Record<FeatureFlagKey, boolean>>;

export function readFeatureFlagOverrides(): FeatureFlagOverrides {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    return parsed as FeatureFlagOverrides;
  } catch {
    return {};
  }
}

export function writeFeatureFlagOverrides(overrides: FeatureFlagOverrides): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}
