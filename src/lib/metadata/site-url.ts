const DEFAULT_SITE_URL = "https://www.edesio.ai";

export const OG_IMAGE_PATH = "/edesio-logo-square.png";

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return new URL(configured);
  }

  return new URL(DEFAULT_SITE_URL);
}

export function getOgImageUrl(): string {
  return new URL(OG_IMAGE_PATH, getSiteUrl()).toString();
}
