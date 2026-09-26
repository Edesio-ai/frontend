"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import type { InvitationToken } from "@/types";
import { formatRelativeTime, formatShortDate, isExpired } from "@/utils/functions/date.utils";
import { getInvitationRegisterUrl } from "@/utils/functions/role.utils";
import { getInvitationFullName, InvitationIdentity } from "./invitation-identity";
import { invitationItemClass } from "./invitation-status.styles";

const ACTION_BUTTON_CLASS =
  "inline-flex items-center gap-[6px] rounded-[7px] border border-border bg-background px-[10px] py-[6px] text-[12px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type PendingInvitationItemProps = {
  invitation: InvitationToken;
  onCancel: (invitation: InvitationToken) => void;
};

export function PendingInvitationItem({ invitation, onCancel }: PendingInvitationItemProps) {
  const t = useTranslations().establishment.invitationsPage.pending;
  const locale = useLocale();
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");
  const [copied, setCopied] = useState(false);
  const expired = isExpired(invitation.expiresAt);
  const fullName = getInvitationFullName(invitation);
  const expiresLabel = (expired ? t.expired : t.expires).replace(
    "{date}",
    formatShortDate(invitation.expiresAt, locale),
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getInvitationRegisterUrl(invitation.token, isAuthNewDesign));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <li className={invitationItemClass(expired)}>
      <InvitationIdentity
        invitation={invitation}
        status="pending"
        meta={
          <time dateTime={invitation.expiresAt} className="m-0 truncate text-[12px] text-zinc-400">
            {expiresLabel}
          </time>
        }
      />

      <div className="flex shrink-0 items-center gap-[12px]">
        <time dateTime={invitation.createdAt} className="text-[12px] text-zinc-400">
          {t.sent.replace("{time}", formatRelativeTime(invitation.createdAt, locale))}
        </time>
        {!expired ? (
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label={t.copyLabel.replace("{name}", fullName)}
            className={ACTION_BUTTON_CLASS}
          >
            {copied ? (
              <Check aria-hidden className="h-[13px] w-[13px] text-green-700" />
            ) : (
              <Copy aria-hidden className="h-[13px] w-[13px]" />
            )}
            {copied ? t.copied : t.copy}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onCancel(invitation)}
          aria-label={t.cancelLabel.replace("{name}", fullName)}
          className={ACTION_BUTTON_CLASS}
        >
          {t.cancel}
        </button>
      </div>
    </li>
  );
}
