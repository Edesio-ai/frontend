"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { runAuthenticatedAction } from "@/lib/auth/run-authenticated-action";
import { getSubscriptionStatusAction } from "../../_actions/subscription-actions";

export type EstablishmentSubscriptionError = {
  status: number;
  message: string;
};

export function useEstablishmentSubscription() {
  const errors = useTranslations().billing.blockModal.new.errors;
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const [error, setError] = useState<EstablishmentSubscriptionError | null>(null);

  useEffect(() => {
    runAuthenticatedAction(getSubscriptionStatusAction, logout)
      .then((response) => {
        if (!response) return;

        if (response.ok) {
          setHasActiveSubscription(response.data.hasActiveSubscription);
          setError(null);
          return;
        }

        setError({
          status: response.status,
          message: errors.subscriptionCheckFailed,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [errors.subscriptionCheckFailed, logout]);

  return { loading, hasActiveSubscription, error };
}
