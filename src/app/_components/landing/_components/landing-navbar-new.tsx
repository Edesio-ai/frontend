"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navLinkClassName =
  "whitespace-nowrap text-[14px] font-medium leading-none tracking-normal text-[#3F3F46] no-underline transition-colors hover:text-[#18181B]";

export function LandingNavbarNew() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();

  const navLinks = [
    { label: t.navbar.links.fonctionnement, href: "#fonctionnement" },
    { label: t.navbar.links.pourQui, href: "#pour-qui" },
    { label: t.navbar.links.benefices, href: "#benefices" },
    { label: t.navbar.links.tarifs, href: "#tarifs" },
    { label: t.navbar.links.faq, href: "#faq" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-20 border-b border-[#E4E4E7] bg-white/[0.92] font-sans backdrop-blur-[8px]"
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
          <span className="text-[15px] font-extrabold leading-none tracking-[-0.01em] text-[#18181B]">Edesio</span>
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
            {t.navbar.login}
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-lg bg-[#18181B] px-4 py-[9px] text-[14px] font-semibold leading-none text-white no-underline transition-opacity hover:opacity-90"
            data-testid="button-signup-nav"
          >
            {t.navbar.signup}
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-[#18181B] lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? t.common.closeMenu : t.common.openMenu}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-[#E4E4E7] bg-white lg:hidden" data-testid="mobile-menu">
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
            <div className="space-y-3 border-t border-[#F0F0F2] pt-4">
              <div className="flex justify-center">
                <LanguageSwitcher variant="segmented" refreshServer />
              </div>
              <Link
                href="/login"
                className="flex h-10 items-center justify-center rounded-lg border border-[#E4E4E7] text-sm font-semibold text-[#18181B] no-underline"
                onClick={closeMobileMenu}
                data-testid="button-mobile-connexion"
              >
                {t.navbar.login}
              </Link>
              <Link
                href="/register"
                className="flex h-10 items-center justify-center rounded-lg bg-[#18181B] text-sm font-semibold text-white no-underline"
                onClick={closeMobileMenu}
                data-testid="button-mobile-signup"
              >
                {t.navbar.signup}
              </Link>
              <a
                href="https://cal.com/alexandre-seuzaret-g9g9me/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center rounded-lg border border-[#E4E4E7] text-sm font-semibold text-[#18181B] no-underline"
                onClick={closeMobileMenu}
                data-testid="button-mobile-demo"
              >
                {t.navbar.demo}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
