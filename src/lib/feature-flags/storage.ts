import { areFeatureFlagOverridesEnabled } from "./env";
import type { FeatureFlagKey } from "./flags";

const STORAGE_KEY = "edesio-feature-flag-overrides";

export type FeatureFlagOverrides = Partial<Record<FeatureFlagKey, boolean>>;

export function readFeatureFlagOverrides(): FeatureFlagOverrides {
  if (typeof window === "undefined" || !areFeatureFlagOverridesEnabled()) {
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
  if (typeof window === "undefined" || !areFeatureFlagOverridesEnabled()) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/**
 * Tiny blocking script: applies local panel overrides to `<html>` before paint.
 * `htmlAttributes` is a map of flag key → attribute name (only flags that need DOM).
 */
export function getFeatureFlagsBootstrapScript(htmlAttributes: Partial<Record<FeatureFlagKey, string>>): string {
  const mappings = Object.fromEntries(
    Object.entries(htmlAttributes).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );

  if (Object.keys(mappings).length === 0) {
    return "";
  }

  return `(function(){try{var o=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}");var a=${JSON.stringify(mappings)};for(var k in a){if(o[k]===true){document.documentElement.setAttribute(a[k],"");}else if(o[k]===false){document.documentElement.removeAttribute(a[k]);}}}catch(e){}})();`;
}
