"use client";

import { useDashboardNav } from "@/components/dashboard/dashboard-nav-context";
import { TeacherAside } from "./teacher-aside";

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const { mobileNavOpen, closeMobileNav } = useDashboardNav();

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

      <TeacherAside mobileOpen={mobileNavOpen} onClose={closeMobileNav} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
