import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edesio - Le chatbot qui entraîne et évalue vos élèves | Solution éducative IA",
  description: "Edesio : solution IA pour établissements scolaires. Les professeurs déposent leurs cours, l'IA génère des questions basées sur le contenu et entraîne les élèves. Découvrez notre plateforme éducative innovante.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
