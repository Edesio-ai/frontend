"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { LANDING_DEMO_BOOKING_URL } from "../landing-links";

export function FinalCtaNew() {
  const t = useTranslations().landing.finalCta.new;

  return (
    <section id="demo" className="mx-auto mt-6 max-w-[1160px] px-6 pb-16 sm:mt-10 sm:pb-20" data-testid="section-demo">
      <div id="signup" />
      <div className="relative overflow-hidden rounded-2xl bg-[#171533] px-5 py-10 text-center sm:rounded-[20px] sm:px-8 sm:py-14 md:px-10 md:py-16">
        <div
          className="pointer-events-none absolute -left-10 -top-16 size-[180px] rounded-full sm:-left-[60px] sm:-top-20 sm:size-[280px]"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.35), rgba(99,102,241,0) 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-6 size-[140px] rounded-full sm:-bottom-[90px] sm:-right-10 sm:size-[220px]"
          style={{
            background: "radial-gradient(circle, rgba(129,140,248,0.28), rgba(129,140,248,0) 70%)",
          }}
          aria-hidden="true"
        />

        <h2
          className="relative z-[1] mx-auto mb-3 max-w-[18rem] text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em] text-white sm:mb-3.5 sm:max-w-[34rem] sm:text-[26px] md:text-[28px]"
          data-testid="text-demo-title"
        >
          {t.title}
        </h2>
        <p className="relative z-[1] mx-auto mb-6 max-w-[20rem] text-sm leading-relaxed text-[#B4B4D6] sm:mb-7 sm:max-w-none sm:text-[15px]">
          {t.subtitle}
        </p>

        <div className="relative z-[1] mx-auto flex w-full max-w-[22rem] flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-auto w-full cursor-pointer rounded-lg bg-primary px-[22px] py-3 text-[15px] font-semibold hover:bg-primary/90 sm:w-auto sm:py-[13px]"
          >
            <Link href="/register" data-testid="button-final-cta-signup">
              {t.ctaPrimary}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-auto w-full cursor-pointer rounded-lg border-[#C7C7CE] bg-white px-[22px] py-3 text-[15px] font-semibold text-foreground hover:bg-zinc-100 sm:w-auto sm:py-[13px]"
          >
            <a
              href={LANDING_DEMO_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-final-cta-demo"
            >
              {t.ctaSecondary}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
