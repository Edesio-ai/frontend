"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useSetLocale } from "@/lib/i18n/client";
import { LOCALE_LABELS, uiLocales, type Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  className?: string;
  /** Soft-refresh RSC after switch (needed for landing server sections) */
  refreshServer?: boolean;
  variant?: "default" | "segmented";
};

function segmentedPillClass(isActive: boolean) {
  return cn(
    "rounded-[5px] border-0 px-2.5 py-1 text-xs font-bold transition-colors",
    isActive ? "bg-white text-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "bg-transparent text-[#A1A1AA]",
  );
}

export function LanguageSwitcher({ className, refreshServer = false, variant = "default" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const { setLocale, isChangingLocale } = useSetLocale();
  const router = useRouter();

  const switchTo = async (next: Locale) => {
    if (isChangingLocale || locale === next) {
      return;
    }

    await setLocale(next);
    if (refreshServer) {
      router.refresh();
    }
  };

  if (variant === "segmented") {
    return (
      <div
        className={cn("inline-flex items-center gap-0.5 rounded-[7px] bg-[#F4F4F5] p-0.5", className)}
        data-testid="language-switcher"
      >
        {uiLocales.map((option) => (
          <button
            key={option}
            type="button"
            lang={option}
            disabled={isChangingLocale}
            aria-label={LOCALE_LABELS[option]}
            aria-pressed={locale === option}
            className={segmentedPillClass(locale === option)}
            onClick={() => void switchTo(option)}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  const activeIndex = Math.max(0, uiLocales.indexOf(locale as (typeof uiLocales)[number]));

  return (
    <div
      data-testid="language-switcher"
      className={cn(
        "relative inline-grid h-7 items-center rounded-full",
        "border border-border/80 bg-muted/40 p-0.5 shadow-sm backdrop-blur-sm",
        isChangingLocale && "pointer-events-none opacity-70",
        className,
      )}
      style={{
        width: `${uiLocales.length * 1.875}rem`,
        gridTemplateColumns: `repeat(${uiLocales.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full",
          "bg-gradient-to-r from-blue-500 to-purple-500 shadow-md shadow-primary/20",
          "transition-transform duration-200 ease-out",
        )}
        style={{
          width: `calc(${100 / uiLocales.length}% - 2px)`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {uiLocales.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          disabled={isChangingLocale}
          aria-label={LOCALE_LABELS[option]}
          aria-pressed={locale === option}
          onClick={() => void switchTo(option)}
          className={cn(
            "relative z-10 h-full rounded-full text-center text-[11px] font-semibold tracking-wide",
            "transition-colors duration-200 hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            locale === option ? "text-white" : "text-muted-foreground",
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
