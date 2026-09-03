"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "./ui/toaster";
import { LocaleProvider, type Dictionary } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { AuthProvider } from "@/contexts/auth-context";
import { FeatureFlagsProvider } from "@/contexts/feature-flags-context";
import { FeatureFlagsPanel } from "@/components/feature-flags/feature-flags-panel";
import { isFeatureFlagsPanelEnabled } from "@/lib/feature-flags/env";

interface ProvidersProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}

export function Providers({ children, locale, dictionary }: ProvidersProps) {
  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <AuthProvider>
        <FeatureFlagsProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            {isFeatureFlagsPanelEnabled() ? <FeatureFlagsPanel /> : null}
          </TooltipProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
