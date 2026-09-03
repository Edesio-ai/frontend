"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { isAdmin } from "@/utils/functions/role.utils";

type BackToHubButtonProps = {
  divider?: "end";
};

export function BackToHubButton({ divider }: BackToHubButtonProps) {
  const { getUserRole } = useAuth();
  const t = useTranslations();

  if (!isAdmin(getUserRole())) return null;

  return (
    <>
      <Link
        href="/hub"
        data-testid="button-back-to-hub"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">{t.hub.backToHub}</span>
      </Link>
      {divider === "end" ? <div className="hidden sm:block h-8 w-px bg-border shrink-0" /> : null}
    </>
  );
}
