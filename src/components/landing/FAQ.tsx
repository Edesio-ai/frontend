import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield, Lock } from "lucide-react";
import { getLocaleFromCookies, getDictionary } from "@/lib/i18n";

export async function FAQ() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = dict.faq;

  return (
    <section
      id="faq"
      className="py-20 md:py-28 lg:py-36 px-4 md:px-8 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-violet-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
      data-testid="section-faq"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg">
            <HelpCircle className="h-7 w-7 text-white" />
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            data-testid="text-faq-title"
          >
            {t.title}{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{t.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.subtitle.replace("{brand}", "Edesio")}
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="space-y-4"
          data-testid="accordion-faq"
        >
          {t.items.map((faq: { question: string; answer: string }, index: number) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-none rounded-2xl px-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid={`accordion-item-${index + 1}`}
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-indigo-200/50 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t.gdprCompliant}</p>
                <p className="text-xs text-muted-foreground">{t.dataProtected}</p>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-indigo-200 dark:bg-slate-600" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t.secureHosting}</p>
                <p className="text-xs text-muted-foreground">{t.europeanServers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
