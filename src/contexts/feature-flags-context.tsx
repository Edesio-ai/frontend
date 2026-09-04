"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FEATURE_FLAG_KEYS, isFeatureFlagOnByDefault, type FeatureFlagKey } from "@/lib/feature-flags/flags";
import { applyFeatureFlagHtmlAttributes } from "@/lib/feature-flags/html";
import {
  readFeatureFlagOverrides,
  writeFeatureFlagOverrides,
  type FeatureFlagOverrides,
} from "@/lib/feature-flags/storage";

type FeatureFlagsContextValue = {
  isEnabled: (key: FeatureFlagKey) => boolean;
  setEnabled: (key: FeatureFlagKey, enabled: boolean) => void;
  resetOverrides: () => void;
  overrides: FeatureFlagOverrides;
  flagKeys: FeatureFlagKey[];
};

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

function resolveEnabled(key: FeatureFlagKey, overrides: FeatureFlagOverrides): boolean {
  if (key in overrides) {
    return overrides[key] ?? false;
  }

  return isFeatureFlagOnByDefault(key);
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<FeatureFlagOverrides>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOverrides(readFeatureFlagOverrides());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    applyFeatureFlagHtmlAttributes((key) => resolveEnabled(key, overrides));
  }, [hydrated, overrides]);

  const persistOverrides = useCallback((next: FeatureFlagOverrides) => {
    setOverrides(next);
    writeFeatureFlagOverrides(next);
  }, []);

  const isEnabled = useCallback((key: FeatureFlagKey) => resolveEnabled(key, overrides), [overrides]);

  const setEnabled = useCallback(
    (key: FeatureFlagKey, enabled: boolean) => {
      persistOverrides({ ...overrides, [key]: enabled });
    },
    [overrides, persistOverrides],
  );

  const resetOverrides = useCallback(() => {
    persistOverrides({});
  }, [persistOverrides]);

  const value = useMemo<FeatureFlagsContextValue>(
    () => ({
      isEnabled,
      setEnabled,
      resetOverrides,
      overrides,
      flagKeys: FEATURE_FLAG_KEYS,
    }),
    [isEnabled, setEnabled, resetOverrides, overrides],
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlagsContext(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlagsContext must be used within FeatureFlagsProvider");
  }
  return context;
}

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const { isEnabled } = useFeatureFlagsContext();
  return isEnabled(key);
}
