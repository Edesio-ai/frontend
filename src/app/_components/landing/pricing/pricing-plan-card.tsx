"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPlanPrice, getDiscountedMonthly } from "./pricing-format";
import { getPricingPlanHref } from "./pricing-plan-links";

type PricingPlanCardProps = {
  plan: {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number | null;
    cta: string;
    popular: boolean;
    features: string[];
  };
  isAnnual: boolean;
  locale: string;
  labels: {
    popular: string;
    perMonth: string;
    perYear: string;
    customQuote: string;
    annualNoteBefore: string;
    annualNoteMiddle: string;
    quoteMailSubject: string;
  };
};

export function PricingPlanCard({ plan, isAnnual, locale, labels }: PricingPlanCardProps) {
  const href = getPricingPlanHref(plan.id, labels.quoteMailSubject);
  const isExternal = href.startsWith("mailto:");

  const monthlyDisplayPrice =
    plan.monthlyPrice !== null ? formatPlanPrice(plan.monthlyPrice, locale) : labels.customQuote;

  const discountedMonthly = plan.monthlyPrice !== null ? getDiscountedMonthly(plan.monthlyPrice) : null;
  const annualTotal = discountedMonthly !== null ? formatPlanPrice(discountedMonthly * 12, locale) : null;
  const annualMonthly = discountedMonthly !== null ? formatPlanPrice(discountedMonthly, locale) : null;
  const oldMonthly = plan.monthlyPrice !== null ? formatPlanPrice(plan.monthlyPrice, locale) : null;

  const ctaClassName = cn(
    "mt-auto block rounded-lg px-2.5 py-2.5 text-center text-[13px] font-semibold no-underline",
    "transition-all duration-200 ease-out active:scale-[0.98]",
    plan.popular
      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25"
      : "bg-muted text-foreground hover:bg-foreground hover:text-background hover:shadow-sm",
  );

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[14px] border bg-background p-6",
        "transition-all duration-300 ease-out hover:-translate-y-1",
        plan.popular
          ? "border-primary hover:shadow-[0_12px_32px_rgba(99,102,241,0.18)]"
          : "border-border hover:border-primary/25 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]",
      )}
      data-testid={`card-plan-${plan.id}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-foreground" data-testid={`text-plan-${plan.id}-name`}>
          {plan.name}
        </h3>
        {plan.popular && (
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
            {labels.popular}
          </span>
        )}
      </div>

      <p className="mb-[18px] min-h-8 text-xs text-tertiary-foreground">{plan.description}</p>

      {plan.monthlyPrice !== null && isAnnual ? (
        <>
          <p className="mb-1 text-[28px] font-extrabold tracking-[-0.02em] text-foreground">
            {annualTotal}
            <span className="text-[13px] font-medium text-landing-subtle">{labels.perYear}</span>
          </p>
          <p className="mb-5 text-[12.5px] leading-relaxed text-tertiary-foreground">
            {labels.annualNoteBefore}
            <strong className="font-bold text-foreground">
              {annualMonthly}
              {labels.perMonth}
            </strong>
            {labels.annualNoteMiddle}
            <span className="line-through">
              {oldMonthly}
              {labels.perMonth}
            </span>
          </p>
        </>
      ) : (
        <p className="mb-5 text-[28px] font-extrabold tracking-[-0.02em] text-foreground">
          {monthlyDisplayPrice}
          {plan.monthlyPrice !== null && (
            <span className="text-[13px] font-medium text-landing-subtle">{labels.perMonth}</span>
          )}
        </p>
      )}

      <ul className="mb-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-[13px] shrink-0 text-primary" aria-hidden="true" />
            <span className="text-[12.5px] leading-relaxed text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>

      {isExternal ? (
        <a href={href} className={ctaClassName} data-testid={`button-plan-${plan.id}-cta`}>
          {plan.cta}
        </a>
      ) : (
        <Link href={href} className={ctaClassName} data-testid={`button-plan-${plan.id}-cta`}>
          {plan.cta}
        </Link>
      )}
    </article>
  );
}
