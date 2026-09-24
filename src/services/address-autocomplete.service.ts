import type { Locale } from "@/lib/i18n/config";
import { ESTABLISHMENT_COUNTRIES, type EstablishmentAddress, type EstablishmentCountry } from "@/types";

function isEstablishmentCountry(code: string): code is EstablishmentCountry {
  return ESTABLISHMENT_COUNTRIES.includes(code as EstablishmentCountry);
}

export type AddressSuggestion = EstablishmentAddress & {
  label: string;
};

type PhotonFeature = {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    country?: string;
    countrycode?: string;
  };
};

type PhotonResponse = {
  features: PhotonFeature[];
};

type FrenchAdresseFeature = {
  properties: {
    label: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
  };
};

type FrenchAdresseResponse = {
  features: FrenchAdresseFeature[];
};

function buildStreetLine(housenumber?: string, street?: string, name?: string): string {
  const line = [housenumber, street].filter(Boolean).join(" ").trim();
  return line || name?.trim() || "";
}

function mapPhotonFeature(feature: PhotonFeature): AddressSuggestion | null {
  const { properties } = feature;
  const street = buildStreetLine(properties.housenumber, properties.street, properties.name);
  const zipCode = properties.postcode?.trim() ?? "";
  const city = properties.city?.trim() ?? "";
  const country = (properties.countrycode ?? "").trim().toUpperCase();

  if (!street || !zipCode || !city || !isEstablishmentCountry(country)) {
    return null;
  }

  const label = [street, `${zipCode} ${city}`, country].join(", ");

  return { label, street, zipCode, city, country };
}

function mapFrenchAdresseFeature(feature: FrenchAdresseFeature): AddressSuggestion | null {
  const { properties } = feature;
  const street = buildStreetLine(properties.housenumber, properties.street, properties.name);
  const zipCode = properties.postcode?.trim() ?? "";
  const city = properties.city?.trim() ?? "";
  const country = "FR";

  if (!street || !zipCode || !city) {
    return null;
  }

  return {
    label: properties.label.trim(),
    street,
    zipCode,
    city,
    country,
  };
}

function dedupeSuggestions(suggestions: AddressSuggestion[]): AddressSuggestion[] {
  const seen = new Set<string>();
  const result: AddressSuggestion[] = [];

  for (const suggestion of suggestions) {
    const key = [suggestion.street, suggestion.zipCode, suggestion.city, suggestion.country].join("|").toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(suggestion);
  }

  return result;
}

async function searchPhoton(query: string, locale: Locale, signal: AbortSignal): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "8",
    lang: locale,
  });

  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as PhotonResponse;

  return data.features
    .map(mapPhotonFeature)
    .filter((suggestion): suggestion is AddressSuggestion => suggestion !== null);
}

async function searchFrenchAdresse(query: string, signal: AbortSignal): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "8",
    autocomplete: "1",
  });

  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?${params.toString()}`, { signal });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as FrenchAdresseResponse;

  return data.features
    .map(mapFrenchAdresseFeature)
    .filter((suggestion): suggestion is AddressSuggestion => suggestion !== null);
}

const MAX_SUGGESTIONS = 8;
const PHOTON_TIMEOUT_MS = 2500;

function withTimeout(signal: AbortSignal, timeoutMs: number): AbortSignal {
  return AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
}

/**
 * Calls `onResults` each time a provider answers, so fast sources (API Adresse)
 * are displayed without waiting for slower ones (Photon).
 */
export async function searchAddresses(
  query: string,
  locale: Locale,
  signal: AbortSignal,
  onResults: (suggestions: AddressSuggestion[]) => void,
): Promise<void> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    onResults([]);
    return;
  }

  let frenchAddresses: AddressSuggestion[] = [];
  let photonAddresses: AddressSuggestion[] = [];

  const emit = () => {
    if (signal.aborted) return;
    onResults(dedupeSuggestions([...frenchAddresses, ...photonAddresses]).slice(0, MAX_SUGGESTIONS));
  };

  const photonSearch = searchPhoton(trimmed, locale, withTimeout(signal, PHOTON_TIMEOUT_MS))
    .then((results) => {
      photonAddresses = results;
      emit();
    })
    .catch(() => undefined);

  if (locale !== "fr") {
    await photonSearch;
    return;
  }

  const frenchSearch = searchFrenchAdresse(trimmed, signal)
    .then((results) => {
      frenchAddresses = results;
      emit();
    })
    .catch(() => undefined);

  await Promise.all([frenchSearch, photonSearch]);
}
