"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { annualDiscountPercent, getPlans } from "@/utils/constants/billing";
import { formatPlanPrice, getDiscountedAnnual, getDiscountedMonthly } from "@/utils/functions/price.utils";
import { USER_ROLE } from "@/utils/functions/role.utils";
import type { BillingPeriodOption } from "../_components/billing-period-field";

export function useEstablishmentBillingOptions() {
  const t = useTranslations();
  const locale = useLocale();

  const establishmentPlan = useMemo(
    () => getPlans(locale).find((plan) => plan.id === USER_ROLE.establishment),
    [locale],
  );
  const monthlyPrice = establishmentPlan?.monthlyPrice ?? 0;

  const billingPeriodOptions = useMemo((): BillingPeriodOption[] => {
    return [
      {
        period: "monthly",
        label: t.billing.monthly,
        price: `${formatPlanPrice(monthlyPrice, locale)}${t.billing.perMonth}`,
      },
      {
        period: "annual",
        label: t.billing.annual,
        price: `${formatPlanPrice(getDiscountedAnnual(monthlyPrice), locale)}${t.billing.perYear}`,
        priceNote: t.billing.orPerMonth.replace("{price}", formatPlanPrice(getDiscountedMonthly(monthlyPrice), locale)),
        badge: `-${annualDiscountPercent}%`,
      },
    ];
  }, [locale, monthlyPrice, t]);

  return { establishmentPlan, billingPeriodOptions };
}
