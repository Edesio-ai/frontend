"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Users, Building2, Crown, Bot, BarChart3, Smartphone, Headphones, Info, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/i18n/client";

const planIcons = [User, Users, Building2, Crown];

const planMeta = [
  {
    id: "solo",
    color: "amber",
    monthlyPrice: 4.9,
    chatbots: 1,
    popular: false,
    ctaLink: "/register",
    gradient: "from-yellow-50 to-amber-50",
    darkGradient: "dark:from-yellow-900/20 dark:to-amber-900/20",
    iconBg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    accentColor: "text-yellow-600 dark:text-yellow-400",
    ringColor: "ring-yellow-500/50",
  },
  {
    id: "professeur",
    color: "blue",
    monthlyPrice: 24.9,
    chatbots: 10,
    popular: false,
    ctaLink: "/register",
    gradient: "from-sky-50 to-indigo-50",
    darkGradient: "dark:from-sky-900/20 dark:to-indigo-900/20",
    iconBg: "bg-gradient-to-br from-sky-400 to-indigo-500",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    ringColor: "ring-indigo-500/50",
  },
  {
    id: "etablissement",
    color: "green",
    monthlyPrice: 299.9,
    chatbots: 150,
    popular: true,
    ctaLink: "#demo",
    gradient: "from-emerald-50 to-green-50",
    darkGradient: "dark:from-emerald-900/20 dark:to-green-900/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    ringColor: "ring-emerald-500/50",
  },
  {
    id: "sur-mesure",
    color: "violet",
    monthlyPrice: null,
    chatbots: null,
    popular: false,
    ctaLink: "#demo",
    gradient: "from-violet-50 to-purple-50",
    darkGradient: "dark:from-violet-900/20 dark:to-purple-900/20",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    accentColor: "text-violet-600 dark:text-violet-400",
    ringColor: "ring-violet-500/50",
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const pt = t.pricing;
  const discountPercent = 15;

  const getPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return null;
    return isAnnual ? monthlyPrice * (1 - discountPercent / 100) : monthlyPrice;
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return pt.onQuote;
    if (locale === "fr") {
      return price.toFixed(2).replace(".", ",") + "€";
    }
    return "$" + price.toFixed(2);
  };

  return (
    <section
      id="tarifs"
      className="py-20 md:py-28 lg:py-36 px-4 md:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 relative overflow-hidden"
      data-testid="section-tarifs"
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-indigo-300 bg-indigo-500/20 rounded-full">
            {pt.badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white" data-testid="text-tarifs-title">
            {pt.title}{" "}
            <span className="bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">
              {pt.titleHighlight}
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">{pt.subtitle}</p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-white" : "text-slate-400"}`}>
              {pt.monthly}
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              data-testid="switch-billing-period"
              className="data-[state=checked]:bg-indigo-500"
            />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-white" : "text-slate-400"}`}>
              {pt.annual}
            </span>
            {isAnnual && (
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white text-xs">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Bot className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-slate-200">{pt.classInfo}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
                  data-testid="button-classe-info"
                >
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-left">
                <p className="font-medium mb-1">{pt.classTooltipTitle}</p>
                <p className="text-xs text-muted-foreground">{pt.classTooltipDesc}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pt.plans.map(
            (
              plan: { name: string; description: string; target: string; cta: string; features: string[] },
              index: number,
            ) => {
              const meta = planMeta[index];
              const Icon = planIcons[index];
              return (
                <Card
                  key={meta.id}
                  className={`relative p-6 flex flex-col overflow-hidden transition-all duration-300 border-none ${
                    meta.popular
                      ? "shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/50 lg:-translate-y-2"
                      : "shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  } bg-gradient-to-br ${meta.gradient} ${meta.darkGradient}`}
                  data-testid={`card-plan-${meta.id}`}
                >
                  {meta.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {pt.popular}
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-5">
                      <div
                        className={`w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center shadow-lg mb-4`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-1" data-testid={`text-plan-${meta.id}-name`}>
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                      <div className="flex items-baseline gap-1">
                        {meta.monthlyPrice !== null ? (
                          <>
                            <span className={`text-3xl font-bold ${meta.accentColor}`}>
                              {formatPrice(getPrice(meta.monthlyPrice))}
                            </span>
                            <span className="text-muted-foreground text-sm">{pt.perMonth}</span>
                          </>
                        ) : (
                          <span className={`text-2xl font-bold ${meta.accentColor}`}>{pt.onQuote}</span>
                        )}
                      </div>
                      {isAnnual && meta.monthlyPrice !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {pt.totalPerYear.replace("{price}", formatPrice(getPrice(meta.monthlyPrice)! * 12))}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full ${featureIndex === 0 ? meta.iconBg : "bg-emerald-500/20"} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            <Check
                              className={`h-2.5 w-2.5 ${featureIndex === 0 ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}
                            />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {meta.ctaLink.startsWith("/") ? (
                      <Button
                        className={`w-full ${meta.popular ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 text-white" : ""}`}
                        variant={meta.popular ? "default" : "secondary"}
                        asChild
                      >
                        <Link href={meta.ctaLink} data-testid={`button-plan-${meta.id}-cta`}>
                          {plan.cta}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${meta.popular ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 text-white" : ""}`}
                        variant={meta.popular ? "default" : "secondary"}
                        asChild
                      >
                        <a href={meta.ctaLink} data-testid={`button-plan-${meta.id}-cta`}>
                          {plan.cta}
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            },
          )}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-10 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.noCommitment}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.mobileIncluded}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-violet-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.statsIncluded}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Headphones className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.reactiveSupport}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
