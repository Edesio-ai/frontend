"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { LandingHeroRobotVisual } from "./hero-robot-visual";

const trustIcons = [Sparkles, ShieldCheck] as const;

export function LandingHeroNew() {
  const t = useTranslations();

  return (
    <section
      className="relative flex min-h-[620px] items-center overflow-hidden bg-hero-gradient font-sans"
      data-testid="section-hero"
    >
      <LandingHeroRobotVisual />

      <div className="relative z-[1] mx-auto grid w-full max-w-[1160px] items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-26">
        <div>
          <p className="mb-[18px] text-[13px] font-semibold tracking-[0.02em] text-hero-eyebrow">{t.heroNew.eyebrow}</p>

          <h1
            className="mb-[22px] text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em] text-hero-foreground sm:text-[44px] lg:text-[52px]"
            data-testid="text-hero-title"
          >
            {t.heroNew.title}
          </h1>

          <p
            className="mb-8 max-w-[480px] text-[17px] leading-[1.6] text-hero-subtitle"
            data-testid="text-hero-subtitle"
          >
            {t.heroNew.subtitle}
          </p>

          <div className="mb-9 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-control text-[15px] font-semibold" asChild>
              <Link href="/register" data-testid="button-hero-signup">
                {t.heroNew.ctaPrimary}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-control border-hero-foreground/30 bg-transparent text-[15px] font-semibold text-hero-foreground hover:bg-hero-foreground/10"
              asChild
            >
              <Link href="/login" data-testid="button-hero-connexion">
                {t.heroNew.ctaSecondary}
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {t.heroNew.trustItems.map((label, index) => {
              const Icon = trustIcons[index];
              return (
                <div key={label} className="flex items-center gap-[7px]">
                  <Icon className="size-[14px] text-hero-trust-icon" aria-hidden="true" />
                  <span className="text-[13px] font-medium text-hero-trust">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
