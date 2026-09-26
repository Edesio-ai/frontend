"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import { EstablishmentPageHeader } from "../_components/establishment-page-header";
import EstablishmentTitle from "./_components/establishment-title";
import { EstablishmentStatsBanner } from "./_components/establishment-stats-banner";
import { PendingInvitationsBanner } from "./_components/pending-invitations-banner";
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
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-[24px] pb-[64px] pt-[28px]">
        <EstablishmentTitle establishment={establishment} />
        <EstablishmentStatsBanner />
        <PendingInvitationsBanner />
      </main>
    </>
  );
}
