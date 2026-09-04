"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useSetLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";

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
        <button
          type="button"
          disabled={isChangingLocale}
          aria-label="Passer en français"
          aria-pressed={locale === "fr"}
          className={segmentedPillClass(locale === "fr")}
          onClick={() => void switchTo("fr")}
        >
          FR
        </button>
        <button
          type="button"
          disabled={isChangingLocale}
          aria-label="Switch to English"
          aria-pressed={locale === "en"}
          className={segmentedPillClass(locale === "en")}
          onClick={() => void switchTo("en")}
        >
          EN
        </button>
      </div>
    );
  }

  const toggle = async () => {
    const next: Locale = locale === "fr" ? "en" : "fr";
    await switchTo(next);
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={isChangingLocale}
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
      data-testid="language-switcher"
      className={cn(
        "relative inline-grid h-7 w-[3.75rem] grid-cols-2 items-center rounded-full",
        "border border-border/80 bg-muted/40 p-0.5 shadow-sm backdrop-blur-sm",
        "transition-opacity duration-150 hover:opacity-90",
        "disabled:pointer-events-none disabled:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full",
          "bg-gradient-to-r from-blue-500 to-purple-500 shadow-md shadow-primary/20",
          "transition-transform duration-200 ease-out",
          locale === "en" && "translate-x-full",
        )}
      />

      <span
        className={cn(
          "relative z-10 text-center text-[11px] font-semibold tracking-wide transition-colors duration-200",
          locale === "fr" ? "text-white" : "text-muted-foreground",
        )}
      >
        FR
      </span>
      <span
        className={cn(
          "relative z-10 text-center text-[11px] font-semibold tracking-wide transition-colors duration-200",
          locale === "en" ? "text-white" : "text-muted-foreground",
        )}
      >
        EN
      </span>
    </button>
  );
}
