import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { EstablishmentInvitation } from "@/types";
import { getInitials } from "@/utils/functions/string.utils";
import { invitationStyles, type InvitationStatus } from "./invitation-status.styles";

type InvitationIdentityProps = {
  invitation: EstablishmentInvitation;
  status: InvitationStatus;
  meta?: ReactNode;
};

export function getInvitationFullName({ firstname, lastname, invitedEmail }: EstablishmentInvitation) {
  const name = `${firstname} ${lastname}`.trim();
  return name || invitedEmail;
}

export function InvitationIdentity({ invitation, status, meta }: InvitationIdentityProps) {
  const fullName = getInvitationFullName(invitation);

  return (
    <div className="flex min-w-0 items-center gap-[12px]">
      <span
        aria-hidden
        className={cn(
          "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold",
          invitationStyles.avatar[status],
        )}
      >
        {getInitials(fullName, { max: 2 })}
      </span>
      <div className="min-w-0">
        <p className="m-0 truncate text-[14px] font-medium text-foreground">{fullName}</p>
        <p className="m-0 truncate text-[12px] text-zinc-400">{invitation.invitedEmail}</p>
        {meta}
      </div>
    </div>
  );
}
