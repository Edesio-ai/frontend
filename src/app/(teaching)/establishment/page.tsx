"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import EstablishmentDashboardLegacy from "./_components/establishment-dashboard-legacy";
import { redirect } from "next/navigation";

export default function Establishment() {
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");

  if (isNewDesign) {
    redirect("/establishment/overview");
  }

  return <EstablishmentDashboardLegacy />;
}
