"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "./ui/toaster";
import { LocaleProvider } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { AuthProvider } from "@/contexts/auth-context";

interface ProvidersProps {
  children: ReactNode;
  locale: Locale;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function Providers({ children, locale, dictionary }: ProvidersProps) {
  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <AuthProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
