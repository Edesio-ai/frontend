import { Card } from "@/components/ui/card";
import { Upload, Sparkles, MessageSquare, BookOpen, Brain, Target } from "lucide-react";
import { getLocaleFromCookies, getDictionary } from "@/lib/i18n";

const stepIcons = [Upload, Sparkles, MessageSquare];
const stepGradients = [
  { gradient: "from-sky-400 to-indigo-500", bgLight: "bg-sky-50 dark:bg-sky-950/30", iconBg: "bg-indigo-500" },
  { gradient: "from-violet-500 to-purple-500", bgLight: "bg-violet-50 dark:bg-violet-950/30", iconBg: "bg-violet-500" },
  {
    gradient: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-500",
  },
];

const featureIcons = [BookOpen, Brain, Target];

export async function Functioning() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = dict.functioning;

  return (
    <section
      id="fonctionnement"
      className="py-20 md:py-28 lg:py-36 px-4 md:px-8 bg-white dark:bg-background"
      data-testid="section-fonctionnement"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-primary bg-primary/10 rounded-full">
            {t.badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-fonctionnement-title">
            {t.title}{" "}
            <span className="bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
              {t.titleHighlight}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="relative mb-20">
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 opacity-20" />

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {t.steps.map((step: { number: string; title: string; description: string }, index: number) => {
              const Icon = stepIcons[index];
              const style = stepGradients[index];
              return (
                <div key={index} className="relative" data-testid={`card-step-${index + 1}`}>
                  <Card
                    className={`p-8 h-full ${style.bgLight} border-none shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div
                      className={`absolute -top-5 left-8 w-10 h-10 rounded-full bg-gradient-to-br ${style.gradient} text-white flex items-center justify-center text-lg font-bold shadow-lg`}
                    >
                      {step.number}
                    </div>

                    <div className="pt-4">
                      <div
                        className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      <h3 className="text-xl font-bold mb-3" data-testid={`text-step-${index + 1}-title`}>
                        {step.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-8">
            {t.features.map((feature: { title: string; description: string }, index: number) => {
              const Icon = featureIcons[index];
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
