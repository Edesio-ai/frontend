"use client";

import { redirect } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import EstablishmentDashboardLegacy from "./_components/establishment-dashboard-legacy";

export default function Establishment() {
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");

  if (!hydrated) {
    return null;
  }

  if (isNewDesign) {
    redirect("/establishment/overview");
  }

  return <EstablishmentDashboardLegacy />;
}
