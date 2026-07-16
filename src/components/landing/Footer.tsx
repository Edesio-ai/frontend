"use client";
import { useState } from "react";
import { Mail, MapPin, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileInstallModal } from "@/components/ui/mobile-install-modal";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const t = useTranslations();
  const ft = t.footer;

  const footerLinks = [
    { label: ft.links.fonctionnement, href: "#fonctionnement" },
    { label: ft.links.benefices, href: "#benefices" },
    { label: ft.links.tarifs, href: "#tarifs" },
    { label: ft.links.faq, href: "#faq" },
    { label: ft.links.blog, href: "/blog", isPage: true },
  ];

  return (
    <>
      <MobileInstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
      <footer
        className="bg-slate-900 text-slate-300 py-16 md:py-20 px-4 md:px-8"
        data-testid="footer"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 md:gap-12 mb-12">
            <div className="md:col-span-2">
              <a
                href="#"
                className="inline-flex items-center gap-3 text-2xl font-bold text-white mb-4"
                data-testid="link-footer-logo"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-purple-500 p-0.5">
                  <img src="/edesio-logo-square.png" alt="Edesio" className="w-full h-full rounded-[10px] object-cover bg-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
              </a>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                {ft.tagline}
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">{ft.gdpr}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span className="text-indigo-400">{ft.hostedInEurope}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{ft.navigation}</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    {link.isPage ? (
                      <Link href={link.href}
                        className="text-slate-400 hover:text-white transition-colors"
                        data-testid={`link-footer-${link.href.slice(1)}`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors"
                        data-testid={`link-footer-${link.href.slice(1)}`}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{ft.mobileApp}</h4>
              <p className="text-slate-400 text-sm mb-4">
                {ft.mobileAppDesc}
              </p>
              <Button
                variant="outline"
                className="w-full border-slate-700 text-white hover:bg-slate-800 hover:text-white"
                onClick={() => setShowInstallModal(true)}
                data-testid="button-footer-install-app"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {ft.howToInstall}
              </Button>

              <div className="mt-6">
                <h4 className="font-semibold text-white mb-3">{ft.contact}</h4>
                <a
                  href="mailto:contact@edesio.ai"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                  data-testid="link-footer-contact"
                >
                  <Mail className="h-4 w-4" />
                  contact@edesio.ai
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Edesio – {ft.allRightsReserved}
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap">
              <Link href="/legal-notice" className="hover:text-slate-300 transition-colors" data-testid="link-footer-mentions-legales">{ft.legalNotice}</Link>
              <Link href="/terms-of-service" className="hover:text-slate-300 transition-colors" data-testid="link-footer-cgu">{ft.terms}</Link>
              <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors" data-testid="link-footer-politique-confidentialite">{ft.privacyPolicy}</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
