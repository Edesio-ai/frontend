"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";

// Dictionary type is inferred from en.json shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = any;

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx?.locale ?? "en";
}

export function useTranslations(): Dictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslations must be used inside LocaleProvider");
  }
  return ctx.dictionary;
}
