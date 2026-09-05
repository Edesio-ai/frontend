"use client";

import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChatSimulation } from "@/components/landing/ChatSimulation";
import { useTranslations } from "@/lib/i18n/client";

export function LandingHeroLegacy() {
  const t = useTranslations().landing.hero.legacy;

  return (
    <section
      className="relative overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 px-4 py-16 sm:px-6 md:px-8 md:py-28 lg:py-36"
      data-testid="section-hero"
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 h-96 w-96 animate-pulse rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-10 top-1/2 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <Badge
              variant="secondary"
              className="gap-2 border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
              data-testid="badge-hero"
            >
              <GraduationCap className="h-4 w-4" />
              {t.badge}
            </Badge>

            <h1
              className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
              data-testid="text-hero-title"
            >
              <span className="bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Edesio
              </span>{" "}
              : {t.title}
            </h1>

            <p
              className="text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl"
              data-testid="text-hero-subtitle"
            >
              {t.subtitle.replace("{brand}", "Edesio")}
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 bg-white text-slate-900 shadow-xl shadow-white/10 hover:bg-slate-100"
                asChild
              >
                <Link href="/register" data-testid="button-hero-signup">
                  <Sparkles className="h-4 w-4" />
                  {t.ctaSignup}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10"
                asChild
              >
                <Link href="/login" data-testid="button-hero-connexion">
                  {t.ctaLogin}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 sm:gap-6">
              <a
                href="https://mistral.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-white/15"
                data-testid="badge-mistral"
              >
                <span className="text-[10px] text-slate-400">{t.poweredBy}</span>
                <img src="/mistral.png" alt="Mistral AI" className="h-8 w-auto" />
                <Badge
                  variant="secondary"
                  className="ml-1 border-indigo-400/30 bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300"
                >
                  {t.frenchAI}
                </Badge>
              </a>
              <div className="hidden h-8 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-sky-400 to-indigo-500">
                    <div className="h-3 w-3 rounded-sm bg-white" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-indigo-500 to-purple-500">
                    <div className="h-3 w-3 rounded-full bg-white" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-violet-500 to-violet-600">
                    <div className="h-2.5 w-2.5 rotate-45 bg-white" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-amber-500 to-orange-500">
                    <div className="h-1.5 w-3 rounded-full bg-white" />
                  </div>
                </div>
                <span className="text-sm text-slate-400">{t.institutions}</span>
              </div>
              <div className="hidden h-8 w-px bg-slate-700 sm:block" />
              <div className="text-sm text-slate-400">
                <span className="font-semibold text-sky-400">RGPD</span> {t.gdpr}
              </div>
            </div>
          </div>

          <div className="order-last">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-sky-400/20 to-purple-500/20 blur-2xl" />
              <div className="relative">
                <ChatSimulation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
