"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { LANDING_DEMO_BOOKING_URL } from "../landing-links";

const navLinkClassName =
  "whitespace-nowrap text-[14px] font-medium leading-none tracking-normal text-landing-nav-link no-underline transition-colors hover:text-foreground";

export function LandingNavbarNew() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const nav = t.landing.navbar;

  const navLinks = [
    { label: nav.links.fonctionnement, href: "#fonctionnement" },
    { label: nav.links.pourQui, href: "#pour-qui" },
    { label: nav.links.benefices, href: "#benefices" },
    { label: nav.links.tarifs, href: "#tarifs" },
    { label: nav.links.faq, href: "#faq" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-20 border-b border-border bg-background/92 font-sans backdrop-blur-[8px]"
      data-testid="navbar"
    >
      <div className="mx-auto flex max-w-[1160px] items-center gap-7 px-6 py-3.5">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2 no-underline" data-testid="link-logo">
          <img
            src="/edesio-logo-square.png"
            alt=""
            className="size-[26px] rounded-md object-cover"
            aria-hidden="true"
          />
          <span className="text-[15px] font-extrabold leading-none tracking-[-0.01em] text-foreground">Edesio</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-[22px] lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={navLinkClassName}
              data-testid={`link-nav-${link.href.slice(1)}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <LanguageSwitcher variant="segmented" refreshServer />
          <Link href="/login" className={navLinkClassName} data-testid="button-connexion">
            {nav.login}
          </Link>
          <Button
            className="rounded-control bg-foreground px-4 py-[9px] text-[14px] font-semibold leading-none text-background hover:opacity-90"
            asChild
          >
            <Link href="/register" data-testid="button-signup-nav">
              {nav.signup}
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? t.common.closeMenu : t.common.openMenu}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-border bg-background lg:hidden" data-testid="mobile-menu">
          <div className="mx-auto max-w-[1160px] space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`${navLinkClassName} block py-2.5 leading-normal`}
                onClick={closeMobileMenu}
                data-testid={`link-mobile-${link.href.slice(1)}`}
              >
                {link.label}
              </a>
            ))}
            <div className="space-y-3 border-t border-landing-nav-divider pt-4">
              <div className="flex justify-center">
                <LanguageSwitcher variant="segmented" refreshServer />
              </div>
              <Button variant="outline" className="w-full rounded-control" asChild>
                <Link href="/login" onClick={closeMobileMenu} data-testid="button-mobile-connexion">
                  {nav.login}
                </Link>
              </Button>
              <Button className="w-full rounded-control bg-foreground text-background hover:opacity-90" asChild>
                <Link href="/register" onClick={closeMobileMenu} data-testid="button-mobile-signup">
                  {nav.signup}
                </Link>
              </Button>
              <Button variant="outline" className="w-full rounded-control" asChild>
                <a
                  href={LANDING_DEMO_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  data-testid="button-mobile-demo"
                >
                  {nav.demo}
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
