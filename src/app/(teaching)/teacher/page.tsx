"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { TeacherDashboardLegacy } from "./_components/teacher-dashboard-legacy";

export default function Teacher() {
  const router = useRouter();
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("TeacherDashboardNewDesign");
  const shouldRedirect = hydrated && isNewDesign;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/teacher/sessions");
    }
  }, [shouldRedirect, router]);

  if (!hydrated) {
    return null;
  }

  if (shouldRedirect) {
    return <LoadingSpinner />;
  }

  return <TeacherDashboardLegacy />;
}
