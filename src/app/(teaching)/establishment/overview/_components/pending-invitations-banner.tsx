"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { useEstablishment } from "../../_contexts/establishment-context";

export function PendingInvitationsBanner() {
  const t = useTranslations().establishment.overview.pendingInvitations;
  const { invitationTokens, invitationTokensLoading } = useEstablishment();
  const pendingCount = invitationTokens.filter((invitation) => invitation.usedAt === null).length;

  if (invitationTokensLoading || pendingCount === 0) {
    return null;
  }

  const title = (pendingCount === 1 ? t.titleOne : t.titleOther).replace("{count}", String(pendingCount));

  return (
    <aside
      className="mb-[44px] flex items-center justify-between gap-[16px] rounded-[12px] border border-border bg-background px-[20px] py-[16px]"
      aria-label={title}
    >
      <div className="flex min-w-0 items-center gap-[12px]">
        <span
          aria-hidden
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[9px] bg-[#FEF6E7] text-[#B45309]"
        >
          <Mail className="h-[16px] w-[16px]" />
        </span>
        <p className="m-0 text-[14px] font-semibold text-foreground">{title}</p>
      </div>

      <Link
        href="/establishment/invitations"
        className="shrink-0 rounded-[8px] border border-border bg-background px-[14px] py-[8px] text-[13px] font-semibold text-foreground transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t.view}
      </Link>
    </aside>
  );
}
