"use client";

import { ErrorPage } from "@/components/error/error-page";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useEstablishmentSubscription } from "../_hooks/use-establishment-subscription";

export default function EstablishmentDashboardNew() {
  const { loading, error } = useEstablishmentSubscription();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorPage status={error.status} message={error.message} />;

  return "test";
}
