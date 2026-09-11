"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { getBillingErrorMessage } from "../_utils/billing-error-message";
import { runAuthenticatedAction } from "@/lib/auth/run-authenticated-action";
import type { Plan } from "@/types";
import { USER_ROLE } from "@/utils/functions/role.utils";
import { getStripeUrlAction } from "../../_actions/billing-actions";
import type { BillingPeriod } from "../_components/billing-period-field";

export function useEstablishmentCheckout(establishmentPlan: Plan | undefined, period: BillingPeriod) {
  const locale = useLocale();
  const errors = useTranslations().billing.blockModal.new.errors;
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    const priceId = period === "monthly" ? establishmentPlan?.priceMonthlyId : establishmentPlan?.priceAnnualId;

    if (!priceId) {
      toast({
        title: errors.checkoutUnavailable,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await runAuthenticatedAction(
        () =>
          getStripeUrlAction({
            priceId,
            planType: USER_ROLE.establishment,
            locale,
          }),
        logout,
      );

      if (!response) return;

      if (response.ok) {
        window.location.href = response.data.url;
        return;
      }

      toast({
        title: getBillingErrorMessage(response.code, errors),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
}
