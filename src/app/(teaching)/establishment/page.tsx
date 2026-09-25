"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import EstablishmentDashboardLegacy from "./_components/establishment-dashboard-legacy";

export default function Establishment() {
  const router = useRouter();
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");
  const shouldRedirect = hydrated && isNewDesign;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/establishment/overview");
    }
  }, [shouldRedirect, router]);

  if (!hydrated || shouldRedirect) {
    return null;
  }

  return <EstablishmentDashboardLegacy />;
}
