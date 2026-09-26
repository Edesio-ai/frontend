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
import { getPricingPlanHref } from "./pricing-plan-links";
import { formatPlanPrice } from "@/utils/functions/price.utils";

const planIcons = [User, Users, Building2, Crown];

const planMeta = [
  {
    id: "solo",
    color: "amber",
    monthlyPrice: 4.9,
    chatbots: 1,
    popular: false,
    planKey: "solo",
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
    planKey: "teacher",
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
    planKey: "establishment",
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
    planKey: "custom",
    gradient: "from-violet-50 to-purple-50",
    darkGradient: "dark:from-violet-900/20 dark:to-purple-900/20",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    accentColor: "text-violet-600 dark:text-violet-400",
    ringColor: "ring-violet-500/50",
  },
];

export function PricingLegacy() {
  const [isAnnual, setIsAnnual] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const pt = t.landing.pricing.legacy;
  const discountPercent = 15;

  const getPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return null;
    return isAnnual ? monthlyPrice * (1 - discountPercent / 100) : monthlyPrice;
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return pt.onQuote;
    return formatPlanPrice(price, locale);
  };

  return (
    <section
      id="tarifs"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 px-4 py-20 md:px-8 md:py-28 lg:py-36"
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

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-4 inline-block rounded-full bg-indigo-500/20 px-4 py-1.5 text-sm font-semibold text-indigo-300">
            {pt.badge}
          </span>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl" data-testid="text-tarifs-title">
            {pt.title}{" "}
            <span className="bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">
              {pt.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">{pt.subtitle}</p>

          <div className="mb-6 flex items-center justify-center gap-4">
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
              <Badge className="border-none bg-gradient-to-r from-indigo-500 to-purple-500 text-xs text-white">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Bot className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-slate-200">{pt.classInfo}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="rounded-full p-0.5 transition-colors hover:bg-white/10"
                  data-testid="button-classe-info"
                >
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-left">
                <p className="mb-1 font-medium">{pt.classTooltipTitle}</p>
                <p className="text-xs text-muted-foreground">{pt.classTooltipDesc}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pt.plans.map(
            (
              plan: { name: string; description: string; target: string; cta: string; features: string[] },
              index: number,
            ) => {
              const meta = planMeta[index];
              const Icon = planIcons[index];
              const ctaLink = getPricingPlanHref(meta.planKey, pt.quoteMailSubject);
              const isMailto = ctaLink.startsWith("mailto:");

              return (
                <Card
                  key={meta.id}
                  className={`relative flex flex-col overflow-hidden border-none p-6 transition-all duration-300 ${
                    meta.popular
                      ? "shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/50 lg:-translate-y-2"
                      : "shadow-xl hover:-translate-y-1 hover:shadow-2xl"
                  } bg-gradient-to-br ${meta.gradient} ${meta.darkGradient}`}
                  data-testid={`card-plan-${meta.id}`}
                >
                  {meta.popular && (
                    <div className="absolute right-0 top-0">
                      <div className="rounded-bl-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-bold text-white">
                        {pt.popular}
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-5">
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${meta.iconBg} shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-1 text-xl font-bold" data-testid={`text-plan-${meta.id}-name`}>
                        {plan.name}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>

                      <div className="flex items-baseline gap-1">
                        {meta.monthlyPrice !== null ? (
                          <>
                            <span className={`text-3xl font-bold ${meta.accentColor}`}>
                              {formatPrice(getPrice(meta.monthlyPrice))}
                            </span>
                            <span className="text-sm text-muted-foreground">{pt.perMonth}</span>
                          </>
                        ) : (
                          <span className={`text-2xl font-bold ${meta.accentColor}`}>{pt.onQuote}</span>
                        )}
                      </div>
                      {isAnnual && meta.monthlyPrice !== null && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pt.totalPerYear.replace("{price}", formatPrice(getPrice(meta.monthlyPrice)! * 12))}
                        </p>
                      )}
                    </div>

                    <ul className="mb-6 flex-1 space-y-2.5">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2.5">
                          <div
                            className={`h-4 w-4 shrink-0 rounded-full ${featureIndex === 0 ? meta.iconBg : "bg-emerald-500/20"} mt-0.5 flex items-center justify-center`}
                          >
                            <Check
                              className={`h-2.5 w-2.5 ${featureIndex === 0 ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}
                            />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isMailto ? (
                      <Button
                        className={`w-full ${meta.popular ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25" : ""}`}
                        variant={meta.popular ? "default" : "secondary"}
                        asChild
                      >
                        <a href={ctaLink} data-testid={`button-plan-${meta.id}-cta`}>
                          {plan.cta}
                        </a>
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${meta.popular ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25" : ""}`}
                        variant={meta.popular ? "default" : "secondary"}
                        asChild
                      >
                        <Link href={ctaLink} data-testid={`button-plan-${meta.id}-cta`}>
                          {plan.cta}
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            },
          )}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm md:gap-10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.noCommitment}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                <Smartphone className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.mobileIncluded}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                <BarChart3 className="h-4 w-4 text-violet-400" />
              </div>
              <span className="text-sm text-slate-300">{pt.statsIncluded}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
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
