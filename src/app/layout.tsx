import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { getLocaleFromCookies, getDictionary } from "@/lib/i18n";
import { getSiteUrl, OG_IMAGE_PATH } from "@/lib/metadata/site-url";
import "./globals.css";

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

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers locale={locale} dictionary={dictionary}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
