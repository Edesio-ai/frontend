"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import { EstablishmentPageHeader } from "../_components/establishment-page-header";
import EstablishmentTitle from "./_components/establishment-title";
import { useEstablishment } from "../_contexts/establishment-context";

export default function EstablishmentOverview() {
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");
  const t = useTranslations().establishment.sidebar.nav;

  const { establishment } = useEstablishment();
  if (!hydrated) {
    return null;
  }

  if (!isNewDesign) {
    notFound();
  }

  return (
    <>
      <EstablishmentPageHeader title={t.overview} />
      <main className="flex-1 pt-[28px] px-[24px] pb-[64px] max-w-[1024px] mx-auto">
        <EstablishmentTitle establishment={establishment} />
      </main>
    </>
  );
}
