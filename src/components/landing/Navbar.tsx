"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Fonctionnement", href: "#fonctionnement" },
  { label: "Pour qui ?", href: "#pour-qui" },
  { label: "Bénéfices", href: "#benefices" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/90 border-b border-border"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a
            href="#"
            className="flex items-center gap-2 text-xl md:text-2xl font-bold text-foreground"
            data-testid="link-logo"
          >
            <img src="/edesio-logo-square.png" alt="Edesio" className="w-10 h-10 rounded-lg object-cover" />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                data-testid={`link-nav-${link.href.slice(1)}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-semibold" asChild>
              <Link href="/login" data-testid="button-connexion">
                Connexion
              </Link>
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/25" asChild>
              <Link href="/register" data-testid="button-signup-nav">
                Créer un compte
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="https://cal.com/alexandre-seuzaret-g9g9me/30min" target="_blank" rel="noopener noreferrer" data-testid="button-demo-nav">
                Demander une démo
              </a>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden border-t border-border bg-background"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobileMenu}
                data-testid={`link-mobile-${link.href.slice(1)}`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              <Button variant="outline" className="w-full font-semibold" asChild>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  data-testid="button-mobile-connexion"
                >
                  Connexion
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  data-testid="button-mobile-signup"
                >
                  Créer un compte
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://cal.com/alexandre-seuzaret-g9g9me/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  data-testid="button-mobile-demo"
                >
                  Demander une démo
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}