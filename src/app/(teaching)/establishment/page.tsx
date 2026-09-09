"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import EstablishmentDashboardLegacy from "./_components/establishment-dashboard-legacy";
import EstablishmentDashboardNew from "./_components/establishment-dashboard-new";

export default function Establishment() {
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");

  return isNewDesign ? <EstablishmentDashboardNew /> : <EstablishmentDashboardLegacy />;
}
