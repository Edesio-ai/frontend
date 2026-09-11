"use client";

import { Menu } from "lucide-react";
import { useEstablishmentNav } from "../_contexts/establishment-nav-context";

type EstablishmentPageHeaderProps = {
  title: string;
};

export function EstablishmentPageHeader({ title }: EstablishmentPageHeaderProps) {
  const { openMobileNav } = useEstablishmentNav();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-6 py-4 min-[860px]:px-6">
      <button
        type="button"
        className="inline-flex p-1 text-zinc-700 min-[860px]:hidden"
        onClick={openMobileNav}
        aria-label="Ouvrir le menu"
        data-testid="button-open-establishment-nav"
      >
        <Menu className="size-5" />
      </button>
      <h1 className="min-w-0 flex-1 text-base font-bold">{title}</h1>
    </header>
  );
}
