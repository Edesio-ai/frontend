"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";

const footerNavLinks = [
  { key: "fonctionnement" as const, href: "#fonctionnement" },
  { key: "pourQui" as const, href: "#pour-qui" },
  { key: "benefices" as const, href: "#benefices" },
  { key: "tarifs" as const, href: "#tarifs" },
  { key: "faq" as const, href: "#faq" },
];

export function FooterNew() {
  const t = useTranslations().landing.footer.new;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-auto max-w-[1160px] px-6 pb-10 pt-14" data-testid="footer">
      <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="mb-3.5 inline-flex items-center gap-2 no-underline" data-testid="link-footer-logo">
            <img src="/edesio-logo-square.png" alt="" className="size-6 rounded-md object-cover" aria-hidden="true" />
            <span className="text-[15px] font-extrabold text-foreground">Edesio</span>
          </Link>
          <p className="mb-3.5 max-w-[320px] text-[13px] leading-relaxed text-tertiary-foreground">{t.tagline}</p>
          <div className="flex flex-wrap gap-4">
            {t.badges.map((badge) => (
              <span key={badge} className="text-xs text-landing-subtle">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[13px] font-bold text-foreground">{t.navigation}</p>
          <nav className="flex flex-col gap-2" aria-label={t.navigation}>
            {footerNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] text-tertiary-foreground no-underline transition-colors hover:text-foreground"
                data-testid={`link-footer-${link.href.slice(1)}`}
              >
                {t.links[link.key]}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-3 text-[13px] font-bold text-foreground">{t.contact}</p>
          <a
            href="mailto:contact@edesio.ai"
            className="text-[13px] text-tertiary-foreground no-underline transition-colors hover:text-foreground"
            data-testid="link-footer-contact"
          >
            contact@edesio.ai
          </a>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <p className="text-xs text-landing-subtle">
          © {currentYear} Edesio – {t.allRightsReserved}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-landing-subtle">
          <Link
            href="/legal-notice"
            className="no-underline transition-colors hover:text-foreground"
            data-testid="link-footer-mentions-legales"
          >
            {t.legalNotice}
          </Link>
          <Link
            href="/terms-of-service"
            className="no-underline transition-colors hover:text-foreground"
            data-testid="link-footer-cgu"
          >
            {t.terms}
          </Link>
          <Link
            href="/privacy-policy"
            className="no-underline transition-colors hover:text-foreground"
            data-testid="link-footer-politique-confidentialite"
          >
            {t.privacyPolicy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
