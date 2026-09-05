"use client";

import { Accordion } from "@/components/ui/accordion";
import { useTranslations } from "@/lib/i18n/client";
import { FaqItem } from "./faq-item";

export function FaqNew() {
  const t = useTranslations().landing.faq.new;

  return (
    <section
      id="faq"
      className="mx-auto max-w-[760px] border-t border-landing-nav-divider bg-background px-6 py-20"
      data-testid="section-faq"
    >
      <header className="mb-10">
        <p className="mb-2 text-[13px] font-semibold text-primary">{t.eyebrow}</p>
        <h2 className="text-[32px] font-extrabold tracking-[-0.02em] text-foreground" data-testid="text-faq-title">
          {t.title}
        </h2>
      </header>

      <Accordion type="single" collapsible className="border-t border-border" data-testid="accordion-faq">
        {t.items.map((item, index) => (
          <FaqItem key={item.question} index={index} question={item.question} answer={item.answer} />
        ))}
      </Accordion>
    </section>
  );
}
