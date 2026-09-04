"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function PageNotFound() {
  const t = useTranslations();
  const copyright = t.notFound.copyright.replace("{year}", String(new Date().getFullYear()));

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white font-sans text-[#18181B]" data-testid="page-not-found">
      <header className="border-b border-[#E4E4E7]">
        <div className="mx-auto flex max-w-[1160px] items-center gap-2 px-6 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 no-underline text-[#18181B]"
            data-testid="link-not-found-home"
          >
            <img
              src="/edesio-logo-square.png"
              alt=""
              className="size-[26px] shrink-0 rounded-md object-cover"
              aria-hidden="true"
            />
            <span className="text-[15px] font-extrabold leading-none tracking-[-0.01em]">Edesio</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] text-center">
          <p className="mb-3 text-[15px] font-bold tracking-[0.02em] text-[#6366F1]">{t.notFound.code}</p>
          <h1 className="mb-3.5 text-[32px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#18181B]">
            {t.notFound.title}
          </h1>
          <p className="mb-8 text-[15px] leading-[1.6] text-[#71717A]">{t.notFound.description}</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#4F46E5]"
              data-testid="link-not-found-back"
            >
              <ArrowLeft className="size-[15px]" strokeWidth={2} />
              {t.notFound.backHome}
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#F0F0F2] px-6 py-5 text-center">
        <span className="text-xs text-[#A1A1AA]">{copyright}</span>
      </footer>
    </div>
  );
}
