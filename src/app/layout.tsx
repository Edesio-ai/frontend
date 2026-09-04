import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { getLocaleFromCookies, getDictionary } from "@/lib/i18n";
import { getSiteUrl, OG_IMAGE_PATH } from "@/lib/metadata/site-url";
import { isFeatureFlagsPanelEnabled } from "@/lib/feature-flags/env";
import { isFeatureFlagOnByDefault } from "@/lib/feature-flags/flags";
import { getEnabledHtmlAttributeProps, getFeatureFlagDomBootstrapScript } from "@/lib/feature-flags/html";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const siteUrl = getSiteUrl();

  return {
    metadataBase: siteUrl,
    title: dict.metadata.title,
    description: dict.metadata.description,
    icons: {
      icon: "/favicon.png",
    },
    openGraph: {
      title: dict.metadata.title,
      description: dict.metadata.description,
      url: siteUrl,
      siteName: "Edesio",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
      images: [
        {
          url: OG_IMAGE_PATH,
          width: 512,
          height: 512,
          alt: "Edesio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: [OG_IMAGE_PATH],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookies();
  const dictionary = await getDictionary(locale);
  const featureFlagHtmlProps = getEnabledHtmlAttributeProps(isFeatureFlagOnByDefault);
  const featureFlagBootstrapScript = isFeatureFlagsPanelEnabled() ? getFeatureFlagDomBootstrapScript() : "";

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`} {...featureFlagHtmlProps}>
      <body className="min-h-full flex flex-col">
        {featureFlagBootstrapScript ? (
          <script dangerouslySetInnerHTML={{ __html: featureFlagBootstrapScript }} />
        ) : null}
        <Providers locale={locale} dictionary={dictionary}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
