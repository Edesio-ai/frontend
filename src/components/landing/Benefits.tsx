import { Card } from "@/components/ui/card";
import { Zap, BarChart3, MessageCircle, Shield, Clock, Target } from "lucide-react";
import { getLocaleFromCookies, getDictionary } from "@/lib/i18n";

const benefitIcons = [Zap, BarChart3, MessageCircle, Shield, Clock, Target];
const benefitStyles = [
  { gradient: "from-amber-500 to-orange-500", bgLight: "bg-amber-50 dark:bg-amber-950/20" },
  { gradient: "from-sky-400 to-indigo-500", bgLight: "bg-sky-50 dark:bg-indigo-950/20" },
  { gradient: "from-emerald-500 to-green-500", bgLight: "bg-emerald-50 dark:bg-emerald-950/20" },
  { gradient: "from-violet-500 to-purple-500", bgLight: "bg-violet-50 dark:bg-violet-950/20" },
  { gradient: "from-rose-500 to-pink-500", bgLight: "bg-rose-50 dark:bg-rose-950/20" },
  { gradient: "from-cyan-500 to-teal-500", bgLight: "bg-cyan-50 dark:bg-cyan-950/20" },
];

export async function Benefits() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = dict.benefits;

  return (
    <section
      id="benefices"
      className="py-20 md:py-28 lg:py-36 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
      data-testid="section-benefices"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            {t.badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-benefices-title">
            {t.title}{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {t.titleHighlight}
            </span>{" "}
            {t.titleSuffix}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.items.map((benefit: { title: string; description: string }, index: number) => {
            const Icon = benefitIcons[index];
            const style = benefitStyles[index];
            return (
              <Card
                key={index}
                className={`p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 ${style.bgLight} group`}
                data-testid={`card-benefit-${index + 1}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2" data-testid={`text-benefit-${index + 1}-title`}>
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
