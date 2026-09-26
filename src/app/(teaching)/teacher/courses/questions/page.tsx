"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function TeacherQuestionsPage() {
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("TeacherDashboardNewDesign");
  const t = useTranslations().teacher.sidebar.nav;

  if (!hydrated) {
    return null;
  }

  if (!isNewDesign) {
    notFound();
  }

  return (
    <>
      <DashboardPageHeader title={t.questions} />
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-[24px] pb-[64px] pt-[28px]" />
    </>
  );
}
