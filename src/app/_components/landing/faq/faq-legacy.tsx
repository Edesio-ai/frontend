"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Shield, Lock } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function FaqLegacy() {
  const t = useTranslations().landing.faq.legacy;

  return (
    <section
      id="faq"
      className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-violet-50/50 px-4 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 md:px-8 md:py-28 lg:py-36"
      data-testid="section-faq"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
            <HelpCircle className="h-7 w-7 text-white" />
          </div>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl" data-testid="text-faq-title">
            {t.title}{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {t.titleHighlight}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.subtitle.replace("{brand}", "Edesio")}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
          {t.items.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="rounded-2xl border-none bg-white/80 px-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/80"
              data-testid={`accordion-item-${index + 1}`}
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline md:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-2xl border border-indigo-200/50 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.gdprCompliant}</p>
                <p className="text-xs text-muted-foreground">{t.dataProtected}</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-indigo-200 dark:bg-slate-600 md:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.secureHosting}</p>
                <p className="text-xs text-muted-foreground">{t.europeanServers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
