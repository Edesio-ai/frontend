import { LOCALE_REGIONS, type Locale } from "@/lib/i18n/config";

export function localeToDateLocale(locale: Locale): string {
  return LOCALE_REGIONS[locale];
}

export const formatDate = (timestamp: number, locale: string = "fr-FR") => {
  return new Date(timestamp * 1000).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function formatFullDate(date: Date, locale: Locale): string {
  const formatted = date.toLocaleDateString(localeToDateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
