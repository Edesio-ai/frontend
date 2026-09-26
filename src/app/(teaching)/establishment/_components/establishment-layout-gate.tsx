"use client";

import { ErrorPage } from "@/components/error/error-page";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { DashboardNavProvider } from "@/components/dashboard/dashboard-nav-context";
import { useEstablishmentSubscription } from "../_hooks/use-establishment-subscription";
import { EstablishmentShell } from "./establishment-shell";
import { EstablishmentSubscriptionBlock } from "./establishment-subscription-block";

function EstablishmentNewLayoutGate({ children }: { children: React.ReactNode }) {
  const { loading, hasActiveSubscription, error } = useEstablishmentSubscription();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorPage status={error.status} message={error.message} />;
  if (!hasActiveSubscription) return <EstablishmentSubscriptionBlock />;

  return (
    <DashboardNavProvider>
      <EstablishmentShell>{children}</EstablishmentShell>
    </DashboardNavProvider>
  );
}

export function EstablishmentLayoutGate({ children }: { children: React.ReactNode }) {
  const hydrated = useFeatureFlagsHydrated();
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");

  if (!hydrated) {
    return <LoadingSpinner />;
  }

  if (!isNewDesign) {
    return <>{children}</>;
  }

  return <EstablishmentNewLayoutGate>{children}</EstablishmentNewLayoutGate>;
}
