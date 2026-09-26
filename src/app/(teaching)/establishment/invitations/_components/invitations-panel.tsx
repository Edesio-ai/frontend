"use client";

import { useTranslations } from "@/lib/i18n/client";
import type { InvitationToken } from "@/types";
import { useEstablishment } from "../../_contexts/establishment-context";
import { AcceptedInvitationItem } from "./accepted-invitation-item";
import { InvitationListSection } from "./invitation-list-section";
import { InvitationsPanelSkeleton } from "./invitations-panel-skeleton";
import { InviteTeacherForm } from "./invite-teacher-form";
import { PendingInvitationItem } from "./pending-invitation-item";

const isAccepted = (invitation: InvitationToken): invitation is InvitationToken & { usedAt: string } =>
  invitation.usedAt !== null;

export function InvitationsPanel() {
  const t = useTranslations().establishment.invitationsPage;
  const { invitationTokens, invitationTokensLoading, deleteInvitationToken } = useEstablishment();

  const pending = invitationTokens.filter((invitation) => !isAccepted(invitation));
  const accepted = invitationTokens.filter(isAccepted);

  const handleCancel = (invitation: InvitationToken) => {
    void deleteInvitationToken(invitation.id);
  };

  if (invitationTokensLoading) {
    return <InvitationsPanelSkeleton />;
  }

  return (
    <div className="w-full max-w-[840px]">
      <InviteTeacherForm />

      <InvitationListSection
        title={t.pending.title}
        status="pending"
        count={pending.length}
        emptyTitle={t.pending.empty.title}
        emptyDescription={t.pending.empty.description}
      >
        {pending.map((invitation) => (
          <PendingInvitationItem key={invitation.id} invitation={invitation} onCancel={handleCancel} />
        ))}
      </InvitationListSection>

      <InvitationListSection
        title={t.accepted.title}
        status="accepted"
        count={accepted.length}
        emptyTitle={t.accepted.empty.title}
        emptyDescription={t.accepted.empty.description}
      >
        {accepted.map((invitation) => (
          <AcceptedInvitationItem key={invitation.id} invitation={invitation} />
        ))}
      </InvitationListSection>
    </div>
  );
}
