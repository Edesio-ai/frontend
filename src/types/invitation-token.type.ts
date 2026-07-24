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

export interface InvitationTokenPreview {
  maskedEmail: string;
  establishmentName: string;
  assignedChatbots?: number;
}

export interface InvitationTokenMutationResponse {
  success: boolean;
}

export interface ValidateInvitationTokenResponse {
  data: unknown;
}
