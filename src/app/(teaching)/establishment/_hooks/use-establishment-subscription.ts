"use client";

import { useEffect, useState } from "react";
import { getSubscriptionStatusAction } from "../../_actions/subscription-actions";

export function useEstablishmentSubscription() {
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionStatusAction().then((response) => {
      if (response.ok) {
        setHasActiveSubscription(response.data.hasActiveSubscription);
      } else {
        setError(response.message ?? "error");
      }
      setLoading(false);
    });
  }, []);

  return { loading, hasActiveSubscription, error };
}
