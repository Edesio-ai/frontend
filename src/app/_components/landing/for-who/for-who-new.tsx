"use client";

import { useTranslations } from "@/lib/i18n/client";
import { LandingSectionHeader } from "../section-header";
import { ForWhoSegment } from "./for-who-segment";

export function ForWhoNew() {
  const t = useTranslations().landing.forWho.new;

  return (
    <section
      id="pour-qui"
      className="mx-auto max-w-[1160px] border-t border-landing-nav-divider bg-background px-6 py-20"
      data-testid="section-pour-qui"
    >
      <LandingSectionHeader eyebrow={t.eyebrow} title={t.title} titleTestId="text-pourqui-title" />
      <div
        className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4"
        data-testid="grid-pour-qui-segments"
      >
        {t.segments.map((segment) => (
          <ForWhoSegment
            key={segment.title}
            title={segment.title}
            subtitle={segment.subtitle}
            bullets={segment.bullets}
          />
        ))}
      </div>
    </section>
  );
}
