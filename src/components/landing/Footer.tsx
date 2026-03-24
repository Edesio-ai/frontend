"use client";
import { useState } from "react";
import { Mail, MapPin, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileInstallModal } from "@/components/ui/mobile-install-modal";
import Link from "next/link";

const footerLinks = [
  { label: "Fonctionnement", href: "#fonctionnement" },
  { label: "Bénéfices", href: "#benefices" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog", isPage: true },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showInstallModal, setShowInstallModal] = useState(false);

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
                La solution IA qui transforme vos cours en expériences
                d'apprentissage interactives pour vos élèves. Conçue pour les collèges, lycées et écoles supérieures.
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">RGPD conforme</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span className="text-indigo-400">Hébergé en Europe</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    {link.isPage ? (
                      <Link  href={link.href}
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
              <h4 className="font-semibold text-white mb-4">Application mobile</h4>
              <p className="text-slate-400 text-sm mb-4">
                Installez Edesio sur votre téléphone pour un accès rapide.
              </p>
              <Button
                variant="outline"
                className="w-full border-slate-700 text-white hover:bg-slate-800 hover:text-white"
                onClick={() => setShowInstallModal(true)}
                data-testid="button-footer-install-app"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Comment installer
              </Button>
              
              <div className="mt-6">
                <h4 className="font-semibold text-white mb-3">Contact</h4>
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
              © {currentYear} Edesio – Tous droits réservés
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap">
              <Link href="/mentions-legales" className="hover:text-slate-300 transition-colors" data-testid="link-footer-mentions-legales">Mentions légales</Link>
              <Link href="/cgu" className="hover:text-slate-300 transition-colors" data-testid="link-footer-cgu">CGU</Link>
              <Link href="/politique-confidentialite" className="hover:text-slate-300 transition-colors" data-testid="link-footer-politique-confidentialite">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
