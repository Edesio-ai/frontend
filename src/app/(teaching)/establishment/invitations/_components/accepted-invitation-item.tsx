"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import type { InvitationToken } from "@/types";
import { formatRelativeTime } from "@/utils/functions/date.utils";
import { InvitationIdentity } from "./invitation-identity";
import { invitationItemClass } from "./invitation-status.styles";

type AcceptedInvitationItemProps = {
  invitation: InvitationToken & { usedAt: string };
};

export function AcceptedInvitationItem({ invitation }: AcceptedInvitationItemProps) {
  const t = useTranslations().establishment.invitationsPage.accepted;
  const locale = useLocale();

  return (
    <li className={invitationItemClass()}>
      <InvitationIdentity invitation={invitation} status="accepted" />

      <div className="flex shrink-0 items-center gap-[12px]">
        <time dateTime={invitation.usedAt} className="text-[12px] text-zinc-400">
          {t.acceptedAt.replace("{time}", formatRelativeTime(invitation.usedAt, locale))}
        </time>
        <span className="inline-flex items-center gap-[4px] text-[12px] font-semibold text-green-700">
          <Check aria-hidden className="h-[13px] w-[13px]" />
          {t.status}
        </span>
      </div>
    </li>
  );
}
