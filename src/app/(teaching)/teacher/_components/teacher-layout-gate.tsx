"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { DashboardNavProvider } from "@/components/dashboard/dashboard-nav-context";
import { TeacherHeader } from "./teacher-header";
import { TeacherShell } from "./teacher-shell";

function TeacherLegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <TeacherHeader />
      {children}
    </>
  );
}

export function TeacherLayoutGate({ children }: { children: React.ReactNode }) {
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("TeacherDashboardNewDesign");

  if (!hydrated) {
    return <LoadingSpinner />;
  }

  if (!isNewDesign) {
    return <TeacherLegacyLayout>{children}</TeacherLegacyLayout>;
  }

  return (
    <DashboardNavProvider>
      <TeacherShell>{children}</TeacherShell>
    </DashboardNavProvider>
  );
}
