import { apiFetch } from "@/lib/api-client";
import type {
  InvitationToken,
  InvitationTokenMutationResponse,
  InvitationTokenPreview,
  ValidateInvitationTokenResponse,
} from "@/types";

export const invitationTokenService = {
  deleteInvitationToken: async (tokenId: string) => {
    return apiFetch<InvitationTokenMutationResponse>(`/api/invitation-token/${tokenId}`, {
      method: "DELETE",
    });
  },
  async getEstablishmentInvitationTokens(establishmentId: string): Promise<InvitationToken[]> {
    const response = await apiFetch<InvitationToken[]>(`/api/invitation-token/establishment/${establishmentId}`);
    return response;
  },
  validateInvitationToken: async (invitationToken: string): Promise<ValidateInvitationTokenResponse> => {
    const reponse = await apiFetch<ValidateInvitationTokenResponse>(`/api/invitation-token/validate`, {
      method: "POST",
      body: JSON.stringify({ token: invitationToken }),
    });
    return reponse;
  },
  async getInvitationTokenPreview(token: string): Promise<InvitationTokenPreview> {
    return await apiFetch<InvitationTokenPreview>(`/api/invitation-token/preview/${token}`, {
      method: "GET",
    });
  },
  async createInvitationToken(body: {
    establishmentId: string;
    token: string;
    invitedEmail: string;
    expiresAt: string;
    assignedChatbots: number;
  }): Promise<InvitationTokenMutationResponse> {
    const response = await apiFetch<InvitationTokenMutationResponse>("/api/invitation-token", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return response;
  },
};
