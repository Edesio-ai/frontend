"use client";

import { ErrorPage } from "@/components/error/error-page";
import { useEstablishmentSubscription } from "../_hooks/use-establishment-subscription";
import { EstablishmentSubscriptionBlock } from "./establishment-subscription-block";

export default function EstablishmentDashboardNew() {
  const { loading, hasActiveSubscription, error } = useEstablishmentSubscription();

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorPage status={error.status} message={error.message} />;
  if (!hasActiveSubscription) return <EstablishmentSubscriptionBlock />;

  return "test";
}
