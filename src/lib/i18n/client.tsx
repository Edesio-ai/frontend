"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { LOCALE_COOKIE, type Locale } from "./config";

// Dictionary type is inferred from en.json shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = any;

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => Promise<void>;
  isChangingLocale: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

function persistLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({
  locale: initialLocale,
  dictionary: initialDictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary);
  const [isPending, startTransition] = useTransition();
  const cacheRef = useRef<Partial<Record<Locale, Dictionary>>>({
    [initialLocale]: initialDictionary,
  });

  useEffect(() => {
    setLocaleState(initialLocale);
    setDictionary(initialDictionary);
    cacheRef.current[initialLocale] = initialDictionary;
  }, [initialLocale, initialDictionary]);

  // Warm the other locale dictionary so switches feel instant.
  // Always (re)load so HMR / updated JSON keys are not stuck behind a stale cache.
  useEffect(() => {
    const other: Locale = initialLocale === "fr" ? "en" : "fr";
    void dictionaryLoaders[other]().then((dict) => {
      cacheRef.current[other] = dict;
    });
  }, [initialLocale]);

  const setLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;

      // Always reload to pick up dictionary updates (avoids empty labels after i18n changes).
      const nextDictionary = await dictionaryLoaders[next]();
      cacheRef.current[next] = nextDictionary;

      persistLocaleCookie(next);
      startTransition(() => {
        setLocaleState(next);
        setDictionary(nextDictionary);
      });
    },
    [locale],
  );

  return (
    <LocaleContext.Provider
      value={{ locale, dictionary, setLocale, isChangingLocale: isPending }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx?.locale ?? "en";
}

export function useSetLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useSetLocale must be used inside LocaleProvider");
  }
  return { setLocale: ctx.setLocale, isChangingLocale: ctx.isChangingLocale };
}

export function useTranslations(): Dictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslations must be used inside LocaleProvider");
  }
  return ctx.dictionary;
}
