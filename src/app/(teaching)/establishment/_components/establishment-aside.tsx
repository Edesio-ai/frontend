"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, GraduationCap, LayoutDashboard, LayoutGrid, LogOut, Mail, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/utils/functions/role.utils";
import { getNameParts, getUserDisplayName, getUserInitials } from "@/utils/functions/user.utils";
import { useEstablishment } from "../_contexts/establishment-context";
import type { EstablishmentNavTab } from "../_utils/establishment-nav";

const NAV_ITEMS: {
  id: EstablishmentNavTab;
  icon: typeof LayoutDashboard;
  href: string;
}[] = [
  { id: "overview", icon: LayoutDashboard, href: "/establishment/overview" },
  { id: "teachers", icon: GraduationCap, href: "/establishment/teachers" },
  { id: "invitations", icon: Mail, href: "/establishment/invitations" },
];

function getActiveTab(pathname: string): EstablishmentNavTab {
  if (pathname.startsWith("/establishment/teachers")) return "teachers";
  if (pathname.startsWith("/establishment/invitations")) return "invitations";
  return "overview";
}

type EstablishmentAsideProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function EstablishmentAside({ mobileOpen, onClose }: EstablishmentAsideProps) {
  const translations = useTranslations();
  const t = translations.establishment.sidebar;
  const { establishment } = useEstablishment();
  const { user, logout, getUserRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  const { firstname, lastname } = getNameParts(user?.metadata);
  const establishmentName = establishment?.name ?? "—";
  const showHubLink = isAdmin(getUserRole());

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 flex h-screen w-[236px] shrink-0 flex-col border-r border-border bg-background transition-transform duration-200 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "min-[860px]:sticky min-[860px]:translate-x-0",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        {showHubLink ? (
          <Link
            href="/hub"
            className="inline-flex shrink-0 items-center gap-1.5 px-1 py-1.5 text-xs font-medium text-landing-subtle no-underline transition-colors hover:text-foreground"
            data-testid="button-back-to-hub"
          >
            <LayoutGrid className="size-[13px]" />
            {t.backToHub}
          </Link>
        ) : (
          <span />
        )}
        <LanguageSwitcher variant="segmented" refreshServer />
      </div>

      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3 pb-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary">
          <Building2 className="size-[17px] text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight text-foreground">{establishmentName}</p>
          <p className="text-[11px] text-landing-subtle">{t.establishmentRole}</p>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex shrink-0 border-none bg-transparent p-1 text-zinc-500 min-[860px]:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
          data-testid="button-close-establishment-nav"
        >
          <X className="size-[18px]" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ id, icon: Icon, href }) => {
          const isActive = activeTab === id;
          return (
            <Link
              key={id}
              href={href}
              onClick={onClose}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm no-underline transition-colors",
                isActive
                  ? "bg-primary-muted font-semibold text-primary"
                  : "bg-transparent font-medium text-zinc-700 hover:bg-zinc-50",
              )}
              data-testid={`nav-establishment-${id}`}
            >
              <Icon className="size-[17px] shrink-0" />
              <span>{t.nav[id]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border p-3.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary">
          {getUserInitials(firstname, lastname)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
            {getUserDisplayName(firstname, lastname, t.direction)}
          </p>
          <p className="text-[11px] text-landing-subtle">{t.administrator}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="border-none bg-transparent p-1 text-landing-subtle transition-colors hover:text-foreground"
          aria-label={translations.nav.logout}
          data-testid="button-logout-sidebar"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
