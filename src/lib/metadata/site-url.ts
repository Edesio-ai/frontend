const DEFAULT_SITE_URL = "https://www.edesio.ai";

export const OG_IMAGE_PATH = "/edesio-logo-square.png";

function parseSiteUrl(value: string): URL | null {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

// Called from the root layout's generateMetadata: throwing here takes down every page.
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  return (configured && parseSiteUrl(configured)) || new URL(DEFAULT_SITE_URL);
}

export function getOgImageUrl(): string {
  return new URL(OG_IMAGE_PATH, getSiteUrl()).toString();
}
