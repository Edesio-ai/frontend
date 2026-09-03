"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Cog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useFeatureFlagsContext } from "@/contexts/feature-flags-context";
import { getFeatureFlagDefinition, type FeatureFlagKey } from "@/lib/feature-flags/flags";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

function getFlagLabel(
  key: FeatureFlagKey,
  flagsDictionary: Record<string, { label?: string; description?: string } | undefined>,
): { label: string; description?: string } {
  const entry = flagsDictionary[key];
  return {
    label: entry?.label ?? key,
    description: entry?.description,
  };
}

export function FeatureFlagsPanel() {
  const t = useTranslations();
  const { flagKeys, isEnabled, setEnabled, resetOverrides, overrides } = useFeatureFlagsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasOverrides = Object.keys(overrides).length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[200]">
      {isOpen ? (
        <button
          type="button"
          aria-label={t.common.close}
          className="pointer-events-auto fixed inset-0 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[210] flex flex-col items-end gap-3">
        {isOpen ? (
          <div
            role="dialog"
            aria-label={t.featureFlags.title}
            className="pointer-events-auto w-[min(100vw-3rem,22rem)] overflow-hidden rounded-xl border bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/90"
            data-testid="panel-feature-flags"
          >
            <div className="flex max-h-[min(24rem,60vh)] flex-col">
              <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">{t.featureFlags.title}</h2>
                  <p className="text-xs text-muted-foreground">{t.featureFlags.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label={t.common.close}
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto px-4 py-3">
                {flagKeys.length === 0 ? (
                  <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                    {t.featureFlags.empty}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {flagKeys.map((key) => {
                      const { label, description } = getFlagLabel(key, t.featureFlags.flags);
                      const checkboxId = `feature-flag-${key}`;

                      return (
                        <li
                          key={key}
                          className="flex items-start gap-3 rounded-md border px-3 py-2.5"
                          data-testid={`feature-flag-item-${key}`}
                        >
                          <Checkbox
                            id={checkboxId}
                            checked={isEnabled(key)}
                            onCheckedChange={(checked) => setEnabled(key, checked === true)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <Label htmlFor={checkboxId} className="cursor-pointer text-sm font-medium leading-none">
                              {label}
                            </Label>
                            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                            <p className="font-mono text-[10px] text-muted-foreground">{key}</p>
                            {!isEnabled(key) && getFeatureFlagDefinition(key)?.defaultEnabled ? (
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                {t.featureFlags.overriddenOff}
                              </p>
                            ) : null}
                            {isEnabled(key) && !getFeatureFlagDefinition(key)?.defaultEnabled ? (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                {t.featureFlags.overriddenOn}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {hasOverrides ? (
                <div className="border-t px-4 py-3">
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={resetOverrides}>
                    {t.featureFlags.reset}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={t.featureFlags.openPanel}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          data-testid="button-feature-flags"
          className={cn(
            "pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-lg backdrop-blur transition-transform hover:scale-105 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isOpen && "scale-105 bg-accent",
          )}
        >
          <Cog className={cn("h-5 w-5 transition-transform duration-200", isOpen && "rotate-90")} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
