"use client";

import { useEstablishmentNav } from "../_contexts/establishment-nav-context";
import { EstablishmentAside } from "./establishment-aside";

export function EstablishmentShell({ children }: { children: React.ReactNode }) {
  const { mobileNavOpen, closeMobileNav } = useEstablishmentNav();

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-foreground">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-[29] bg-black/30 min-[860px]:hidden"
          onClick={closeMobileNav}
        />
      ) : null}

      <EstablishmentAside mobileOpen={mobileNavOpen} onClose={closeMobileNav} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
