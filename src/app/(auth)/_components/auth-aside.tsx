"use client";
import { Logo } from "@/components/brand/logo";
import { useTranslations } from "@/lib/i18n/client";
import { Check, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthAside() {
  const trustIcons = [Sparkles, ShieldCheck] as const;

  const t = useTranslations().auth.layout.aside;
  return (
    <aside className="hidden h-dvh w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex">
      <Logo
        size="sm"
        markClassName="size-[26px] rounded-md"
        wordmarkClassName="bg-none bg-clip-padding text-[15px] font-extrabold tracking-[-0.01em] text-background brand:text-background"
      />

      <div>
        <h1 className="mb-7 max-w-[420px] text-2xl font-bold leading-[1.4] tracking-[-0.01em] text-background">
          {t.panelStatement}
        </h1>
        <ul className="flex flex-col gap-3">
          {t.panelBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5">
              <Check className="mt-[3px] size-3.5 shrink-0 text-hero-trust-icon" aria-hidden="true" />
              <span className="text-sm leading-normal text-landing-faint">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex gap-5">
        {t.trustItems.map((item, index) => {
          const Icon = trustIcons[index];
          return (
            <li key={item} className="flex items-center gap-1.5">
              {Icon ? <Icon className="size-[13px] shrink-0 text-tertiary-foreground" aria-hidden="true" /> : null}
              <span className="text-xs text-tertiary-foreground">{item}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
