"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import { EstablishmentPageHeader } from "../_components/establishment-page-header";
import { TeachersTable } from "./_components/teachers-table";

export default function EstablishmentTeachersPage() {
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
      <EstablishmentPageHeader title={t.teachers} />
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-[24px] pb-[64px] pt-[28px]">
        <TeachersTable />
      </main>
    </>
  );
}
