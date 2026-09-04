"use client";

import type { ReactNode } from "react";
import { PageNotFound } from "@/components/not-found/page-not-found";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import type { FeatureFlagKey } from "@/lib/feature-flags/flags";

type FeatureFlagPageProps = {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
};

export function FeatureFlagPage({ flag, children, fallback }: FeatureFlagPageProps) {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return fallback ?? <PageNotFound />;
  }

  return <>{children}</>;
}
