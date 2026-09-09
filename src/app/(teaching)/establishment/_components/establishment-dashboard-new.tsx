"use client";

import { useEstablishmentSubscription } from "../_hooks/use-establishment-subscription";
import { EstablishmentSubscriptionBlock } from "./establishment-subscription-block";

export default function EstablishmentDashboardNew() {
  const { loading, hasActiveSubscription, error } = useEstablishmentSubscription();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hasActiveSubscription) return <EstablishmentSubscriptionBlock />;
  return "test";
}
