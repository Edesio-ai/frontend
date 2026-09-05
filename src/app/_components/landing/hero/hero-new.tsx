"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { LandingHeroRobotVisual } from "./hero-robot-visual";

const trustIcons = [Sparkles, ShieldCheck] as const;

export function LandingHeroNew() {
  const t = useTranslations().landing.hero.new;

  return (
    <section className="overflow-hidden bg-hero-gradient font-sans" data-testid="section-hero">
      <div className="mx-auto w-full max-w-[1160px] px-5 py-14 sm:px-6 sm:py-20 lg:py-24 lg:pb-26">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-16">
          <div>
            <p className="mb-4 text-[13px] font-semibold tracking-[0.02em] text-hero-eyebrow sm:mb-[18px]">
              {t.eyebrow}
            </p>

            <h1
              className="mb-5 text-[28px] font-extrabold leading-[1.08] tracking-[-0.025em] text-hero-foreground sm:mb-[22px] sm:text-[36px] md:text-[44px] lg:text-[52px]"
              data-testid="text-hero-title"
            >
              {t.title}
            </h1>

            <p
              className="mb-7 max-w-[480px] text-[15px] leading-[1.65] text-hero-subtitle sm:mb-8 sm:text-[17px] sm:leading-[1.6]"
              data-testid="text-hero-subtitle"
            >
              {t.subtitle}
            </p>

            <div className="mb-7 flex w-full max-w-sm flex-col gap-3 sm:mb-9 sm:max-w-none sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="h-auto w-full rounded-control py-3 text-[15px] font-semibold sm:w-auto sm:py-2.5"
                asChild
              >
                <Link href="/register" data-testid="button-hero-signup">
                  {t.ctaPrimary}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto w-full rounded-control border-hero-foreground/30 bg-transparent py-3 text-[15px] font-semibold text-hero-foreground hover:bg-hero-foreground/10 sm:w-auto sm:py-2.5"
                asChild
              >
                <Link href="/login" data-testid="button-hero-connexion">
                  {t.ctaSecondary}
                </Link>
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              {t.trustItems.map((label, index) => {
                const Icon = trustIcons[index];
                return (
                  <div key={label} className="flex items-center gap-[7px]">
                    <Icon className="size-[14px] shrink-0 text-hero-trust-icon" aria-hidden="true" />
                    <span className="text-[13px] font-medium text-hero-trust">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-0 h-[300px] w-full overflow-hidden sm:h-[360px] lg:min-h-[560px] lg:h-full lg:max-h-[640px]">
            <LandingHeroRobotVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
