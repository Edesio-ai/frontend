"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { InvitationsPanel } from "./_components/invitations-panel";

export default function EstablishmentInvitationsPage() {
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");
  const t = useTranslations().establishment.sidebar.nav;

  if (!hydrated) {
    return null;
  }

  if (!isNewDesign) {
    notFound();
  }

  return (
    <>
      <DashboardPageHeader title={t.invitations} />
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-[24px] pb-[64px] pt-[28px]">
        <InvitationsPanel />
      </main>
    </>
  );
}
