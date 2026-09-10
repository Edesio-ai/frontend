"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, LayoutDashboard, LayoutGrid, LogOut, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/utils/functions/role.utils";
import { getNameParts, getUserDisplayName, getUserInitials } from "@/utils/functions/user.utils";
import { useEstablishment } from "../_contexts/establishment-context";

export type EstablishmentNavTab = "overview" | "teachers" | "invitations";

const NAV_ITEMS: { id: EstablishmentNavTab; icon: typeof LayoutDashboard }[] = [
  { id: "overview", icon: LayoutDashboard },
  { id: "teachers", icon: GraduationCap },
  { id: "invitations", icon: Mail },
];

type EstablishmentAsideProps = {
  activeTab?: EstablishmentNavTab;
  onTabChange?: (tab: EstablishmentNavTab) => void;
};

export function EstablishmentAside({ activeTab = "overview", onTabChange }: EstablishmentAsideProps) {
  const translations = useTranslations();
  const t = translations.establishment.sidebar;
  const { establishment } = useEstablishment();
  const { user, logout, getUserRole } = useAuth();
  const router = useRouter();

  const { firstname, lastname } = getNameParts(user?.metadata);
  const establishmentName = establishment?.name ?? "—";
  const showHubLink = isAdmin(getUserRole());

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-border bg-background">
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
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-foreground">{establishmentName}</p>
          <p className="text-[11px] text-landing-subtle">{t.establishmentRole}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange?.(id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg border-none px-3 py-2.5 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary-muted font-semibold text-primary"
                  : "bg-transparent font-medium text-zinc-700 hover:bg-zinc-50",
              )}
              data-testid={`nav-establishment-${id}`}
            >
              <Icon className="size-[17px] shrink-0" />
              <span>{t.nav[id]}</span>
            </button>
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
