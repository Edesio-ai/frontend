"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { LOCALE_COOKIE, type Locale } from "./config";

export type Dictionary = typeof import("./dictionaries/en.json");

type Dictionaries = Partial<Record<Locale, Dictionary>>;

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
  dictionaries: Dictionaries;
  loadDictionary: (locale: Locale) => Promise<Dictionary>;
  setLocale: (locale: Locale) => Promise<void>;
  isChangingLocale: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
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
  const [dictionaries, setDictionaries] = useState<Dictionaries>({ [initialLocale]: initialDictionary });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocaleState(initialLocale);
    setDictionaries((prev) => ({ ...prev, [initialLocale]: initialDictionary }));
  }, [initialLocale, initialDictionary]);

  const loadDictionary = useCallback(async (target: Locale) => {
    const loaded = await dictionaryLoaders[target]();
    setDictionaries((prev) => (prev[target] === loaded ? prev : { ...prev, [target]: loaded }));
    return loaded;
  }, []);

  const setLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;

      // Always reload to pick up dictionary updates (avoids empty labels after i18n changes).
      await loadDictionary(next);

      persistLocaleCookie(next);
      startTransition(() => {
        setLocaleState(next);
      });
    },
    [locale, loadDictionary],
  );

  const dictionary = dictionaries[locale] ?? initialDictionary;

  return (
    <LocaleContext.Provider
      value={{ locale, dictionary, dictionaries, loadDictionary, setLocale, isChangingLocale: isPending }}
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

/**
 * Without argument, returns the UI dictionary. With a locale (e.g. the session language for the
 * chatbot), returns that dictionary once loaded, falling back to the UI dictionary meanwhile.
 */
export function useTranslations(locale?: Locale): Dictionary {
  const ctx = useContext(LocaleContext);
  const target = locale ?? ctx?.locale;
  const requested = target ? ctx?.dictionaries[target] : undefined;
  const loadDictionary = ctx?.loadDictionary;

  useEffect(() => {
    if (target && !requested && loadDictionary) {
      void loadDictionary(target);
    }
  }, [target, requested, loadDictionary]);

  if (!ctx) {
    throw new Error("useTranslations must be used inside LocaleProvider");
  }
  return requested ?? ctx.dictionary;
}
