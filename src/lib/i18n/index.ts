import "server-only";
import { cookies } from "next/headers";
import {
  locales,
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./config";
export type { Locale } from "./config";
export { locales, defaultLocale, isLocale, LOCALE_COOKIE };

type DictionaryLoader = () => Promise<unknown>;

const dictionaries: Record<string, DictionaryLoader> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export async function getDictionary(locale: string) {
  const loader = dictionaries[isLocale(locale) ? locale : defaultLocale];
  return loader() as Promise<Dictionary>;
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export type Dictionary = typeof import("./dictionaries/en.json");
