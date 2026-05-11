export interface InvitationToken {
    id: string;
    establishmentId: string;
    token: string;
    invitedEmail: string;
    expiresAt: string;
    usedAt: string | null;
    usedBy: string | null;
    createdAt: string;
    availableChatbots: number;
  }
  