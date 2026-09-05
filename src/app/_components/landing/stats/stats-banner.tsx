"use client";

import { useTranslations } from "@/lib/i18n/client";
import { StatsBannerItem } from "./stats-banner-item";

export function StatsBanner() {
  const t = useTranslations().landing.stats.new;

  return (
    <section className="bg-landing-stats-gradient px-6 py-10 md:py-14" data-testid="section-stats-banner">
      <div className="mx-auto flex max-w-[1160px] flex-col md:grid md:grid-cols-3 md:gap-6">
        {t.items.map((item) => (
          <StatsBannerItem key={item.value} icon={item.icon} value={item.value} label={item.label} />
        ))}
      </div>
    </section>
  );
}
