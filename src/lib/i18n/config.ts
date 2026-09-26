import type { Language } from "@/types/teaching/session.type";

export const locales = ["en", "fr", "es", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_REGIONS: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

export const SESSION_LANGUAGE_LOCALES: Record<Language, Locale> = {
  francais: "fr",
  anglais: "en",
  espagnol: "es",
  allemand: "de",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

// Locales users can pick for the interface. The others are only used by the chatbot (session language).
export const uiLocales = ["en", "fr"] as const satisfies readonly Locale[];
export type UiLocale = (typeof uiLocales)[number];

export function isUiLocale(value: string): value is UiLocale {
  return uiLocales.includes(value as UiLocale);
}

// The backend (emails, Stripe checkout) only supports these locales.
export const BACKEND_LOCALES = ["fr", "en"] as const;
export type BackendLocale = (typeof BACKEND_LOCALES)[number];

export function toBackendLocale(locale: Locale): BackendLocale {
  return locale === "fr" ? "fr" : "en";
}
