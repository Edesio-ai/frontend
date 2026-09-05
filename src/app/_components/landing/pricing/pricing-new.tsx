"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { PricingBillingToggle } from "./pricing-billing-toggle";
import { PricingPlanCard } from "./pricing-plan-card";

export function PricingNew() {
  const [isAnnual, setIsAnnual] = useState(false);
  const t = useTranslations().landing.pricing.new;
  const locale = useLocale();

  return (
    <section
      id="tarifs"
      className="mx-auto max-w-[1160px] border-t border-landing-nav-divider bg-background px-6 py-20"
      data-testid="section-tarifs"
    >
      <header className="mb-7">
        <p className="mb-2 text-[13px] font-semibold text-primary">{t.eyebrow}</p>
        <h2
          className="mb-2.5 text-[32px] font-extrabold tracking-[-0.02em] text-foreground"
          data-testid="text-tarifs-title"
        >
          {t.title}
        </h2>
        <p className="mb-2 text-sm text-tertiary-foreground">{t.subtitle}</p>
        <p className="text-[13px] text-landing-subtle">{t.subtitleSecondary}</p>
      </header>

      <PricingBillingToggle
        isAnnual={isAnnual}
        onChange={setIsAnnual}
        monthlyLabel={t.monthly}
        annualLabel={t.annual}
        discountLabel={t.discount}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="grid-pricing-plans">
        {t.plans.map((plan) => (
          <PricingPlanCard
            key={plan.id}
            plan={plan}
            isAnnual={isAnnual}
            locale={locale}
            labels={{
              popular: t.popular,
              perMonth: t.perMonth,
              perYear: t.perYear,
              customQuote: t.customQuote,
              annualNoteBefore: t.annualNoteBefore,
              annualNoteMiddle: t.annualNoteMiddle,
              quoteMailSubject: t.quoteMailSubject,
            }}
          />
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
        {t.notes.map((note) => (
          <span key={note} className="text-[12.5px] text-landing-subtle">
            {note}
          </span>
        ))}
      </div>
    </section>
  );
}
