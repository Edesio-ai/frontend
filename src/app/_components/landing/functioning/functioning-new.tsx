"use client";

import { useTranslations } from "@/lib/i18n/client";
import { LandingSectionHeader } from "../section-header";
import { FunctioningStep } from "./functioning-step";
import { FunctioningHighlight } from "./functioning-highlight";

export function FunctioningNew() {
  const t = useTranslations().landing.functioning.new;

  return (
    <section
      id="fonctionnement"
      className="mx-auto max-w-[1160px] border-t border-landing-nav-divider bg-background px-6 py-20"
      data-testid="section-fonctionnement"
    >
      <LandingSectionHeader eyebrow={t.eyebrow} title={t.title} titleTestId="text-fonctionnement-title" />
      <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-3">
        {t.steps.map((step, index) => (
          <FunctioningStep key={step.title} number={index + 1} title={step.title} description={step.description} />
        ))}
      </div>
      <div
        className="grid grid-cols-1 overflow-hidden rounded-[14px] border border-border md:grid-cols-3"
        data-testid="grid-fonctionnement-highlights"
      >
        {t.highlights.map((highlight, index) => (
          <FunctioningHighlight
            key={highlight.title}
            title={highlight.title}
            description={highlight.description}
            isLast={index === t.highlights.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
