"use client";

import { useTranslations } from "@/lib/i18n/client";
import { LandingSectionHeader } from "../section-header";
import { BenefitsItem } from "./benefits-item";

export function BenefitsNew() {
  const t = useTranslations().landing.benefits.new;

  return (
    <section
      id="benefices"
      className="mx-auto max-w-[1160px] border-t border-landing-nav-divider bg-background px-6 py-20"
      data-testid="section-benefices"
    >
      <LandingSectionHeader eyebrow={t.eyebrow} title={t.title} titleTestId="text-benefices-title" />
      <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid-benefices">
        {t.items.map((item, index) => (
          <BenefitsItem
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
