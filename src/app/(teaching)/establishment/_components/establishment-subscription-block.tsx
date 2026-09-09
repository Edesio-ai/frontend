"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";
import { USER_ROLE } from "@/utils/functions/role.utils";
import { EstablishmentSubscriptionBlockHeader } from "./establishment-subscription-block-header";
import { PlanCard } from "./plan-card";

type EstablishmentSubscriptionBlockProps = {
  planName?: string;
};

export function EstablishmentSubscriptionBlock({ planName }: EstablishmentSubscriptionBlockProps) {
  const t = useTranslations();
  const bt = t.billing.blockModal.new;
  const displayPlanName = planName ?? t.billing.planDetails.establishment.name;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-6">
      <div className="w-full max-w-[400px]">
        <EstablishmentSubscriptionBlockHeader icon={<CreditCard className="size-5" />} />
        <p className="mb-5 text-sm leading-relaxed text-zinc-600">{bt.requiredDesc}</p>

        <PlanCard planName={displayPlanName} icon={<CreditCard className="size-4 shrink-0 text-primary" />} />

        <Button
          asChild
          className="mb-2.5 h-auto w-full gap-2 rounded-[9px] bg-foreground py-3.5 text-sm font-semibold text-background hover:bg-foreground/90"
        >
          <Link href={`/billing/choose-plan?plan=${USER_ROLE.establishment}`}>
            <ArrowRight className="size-[15px]" />
            {bt.subscribe}
          </Link>
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
