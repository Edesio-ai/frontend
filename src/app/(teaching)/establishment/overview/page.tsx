"use client";

import { ErrorPage } from "@/components/error/error-page";
import { useEstablishmentSubscription } from "../_hooks/use-establishment-subscription";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EstablishmentSubscriptionBlock } from "../_components/establishment-subscription-block";
import { EstablishmentPageHeader } from "../_components/establishment-page-header";
import { useTranslations } from "@/lib/i18n/client";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { notFound } from "next/navigation";

export default function EstablishmentOverview() {
  const { loading, hasActiveSubscription, error } = useEstablishmentSubscription();
  const isNewDesign = useFeatureFlag("EstablishmentDashboardNewDesign");
  const t = useTranslations().establishment.sidebar.nav;

  if (!isNewDesign) {
    notFound();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorPage status={error.status} message={error.message} />;
  if (!hasActiveSubscription) return <EstablishmentSubscriptionBlock />;

  return (
    <>
      <EstablishmentPageHeader title={t.overview} />
      <div className="flex-1 px-6 py-7 min-[860px]:px-6" />
    </>
  );
}
