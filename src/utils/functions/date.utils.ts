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

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function formatRelativeTime(date: string | Date, locale: Locale, now: number = Date.now()): string {
  const seconds = Math.round((new Date(date).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(localeToDateLocale(locale), { numeric: "auto" });

  for (const [unit, unitSeconds] of RELATIVE_TIME_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }

  return formatter.format(0, "second");
}

export function isExpired(date: string | Date, now: number = Date.now()): boolean {
  return new Date(date).getTime() < now;
}

export function formatShortDate(date: string | Date, locale: Locale): string {
  return new Date(date).toLocaleDateString(localeToDateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatFullDate(date: Date, locale: Locale): string {
  const formatted = date.toLocaleDateString(localeToDateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
