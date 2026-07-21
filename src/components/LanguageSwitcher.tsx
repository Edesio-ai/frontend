"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useSetLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  className?: string;
  /** Soft-refresh RSC after switch (needed for landing server sections) */
  refreshServer?: boolean;
};

export function LanguageSwitcher({
  className,
  refreshServer = false,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const { setLocale, isChangingLocale } = useSetLocale();
  const router = useRouter();

  const toggle = async () => {
    if (isChangingLocale) return;
    const next: Locale = locale === "fr" ? "en" : "fr";
    await setLocale(next);
    if (refreshServer) {
      router.refresh();
    }
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
      {/* Sliding pill — fixed size, no layout shift */}
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
