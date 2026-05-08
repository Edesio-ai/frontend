import { apiFetch } from "@/lib/api-client";

export const invitationTokenService = {
    deleteInvitationToken: async (tokenId: string) => {
        return apiFetch<any>(`/api/invitation-token/${tokenId}`, {
            method: "DELETE",
        });
    },
    async getEstablishmentInvitationTokens(establishmentId: string): Promise<any> {
        const response = await apiFetch(`/api/invitation-token/establishment/${establishmentId}`);
        return response;
    },
    validateInvitationToken: async (invitationToken: string): Promise<any> => {
        const reponse = await apiFetch(`/api/invitation-token/validate`, {
          method: "POST",
          body: JSON.stringify({ token: invitationToken }),
        });
        return reponse as any;
      },
      async getInvitationTokenPreview(token: string): Promise<any> {
        return await apiFetch<any>(`/invitation-token/preview/${token}`, {
            method: "GET",
        });
    },
    async createInvitationToken(body: { establishmentId: string, token: string, invitedEmail: string, expiresAt: string, assignedChatbots: number }): Promise<any> {
        const response = await apiFetch("/api/invitation-token", {
            method: "POST",
            body: JSON.stringify(body),
        });

        return response;
    },
};