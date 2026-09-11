"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import { EstablishmentPageHeader } from "../_components/establishment-page-header";

export default function EstablishmentTeachersPage() {
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");
  const t = useTranslations().establishment.sidebar.nav;

  if (!isNewDesign) {
    notFound();
  }

  return (
    <>
      <EstablishmentPageHeader title={t.teachers} />
      <div className="flex-1 px-6 py-7" />
    </>
  );
}
