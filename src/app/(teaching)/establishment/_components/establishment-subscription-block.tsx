"use client";

import { useState } from "react";
import { ArrowRight, CreditCard, Loader, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { BillingPeriodField, type BillingPeriod } from "./billing-period-field";
import { EstablishmentSubscriptionBlockHeader } from "./establishment-subscription-block-header";
import { PlanCard } from "./plan-card";
import { useEstablishmentBillingOptions } from "../_hooks/use-establishment-billing-options";
import { useEstablishmentCheckout } from "../_hooks/use-establishment-checkout";

type EstablishmentSubscriptionBlockProps = {
  planName?: string;
};

export function EstablishmentSubscriptionBlock({ planName }: EstablishmentSubscriptionBlockProps) {
  const t = useTranslations();
  const bt = t.billing.blockModal.new;
  const { logout } = useAuth();
  const displayPlanName = planName ?? t.billing.planDetails.establishment.name;
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const { establishmentPlan, billingPeriodOptions } = useEstablishmentBillingOptions();
  const { subscribe, loading } = useEstablishmentCheckout(establishmentPlan, period);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-6">
      <div className="w-full max-w-[400px]">
        <EstablishmentSubscriptionBlockHeader icon={<CreditCard className="size-5" />} />
        <p className="mb-5 text-sm leading-relaxed text-zinc-600">{bt.requiredDesc}</p>

        <PlanCard planName={displayPlanName} icon={<CreditCard className="size-4 shrink-0 text-primary" />} />

        <BillingPeriodField
          legend={bt.periodLabel}
          value={period}
          onChange={setPeriod}
          options={billingPeriodOptions}
        />

        <Button
          type="button"
          disabled={loading}
          className="mb-2.5 h-auto w-full gap-2 rounded-[9px] bg-foreground py-3.5 text-sm font-semibold text-background hover:bg-foreground/90"
          onClick={subscribe}
        >
          {loading ? <Loader className="size-[15px] animate-spin" /> : <ArrowRight className="size-[15px]" />}
          {loading ? t.billing.subscribing : bt.subscribe}
        </Button>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-[18px]">
          <p className="m-0 text-xs text-landing-subtle">
            {bt.contactQuestion}{" "}
            <a
              href="mailto:contact@edesio.ai"
              className="font-semibold text-foreground no-underline hover:text-foreground/80"
            >
              edesio.founders@gmail.com
            </a>
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 border-none bg-transparent text-xs font-medium text-landing-subtle hover:text-foreground"
          >
            <LogOut className="size-[13px]" />
            {t.nav.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
