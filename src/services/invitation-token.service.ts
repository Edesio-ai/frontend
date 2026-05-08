import { apiFetch } from "@/lib/api-client";

export const invitationTokenService = {
    deleteInvitationToken: async (tokenId: string) => {
        return apiFetch<any>(`/api/invitation-token/${tokenId}`, {
            method: "DELETE",
        });
    },
    async getInvitationTokens(establishmentId: string): Promise<any> {
        const response = await apiFetch(`/api/establishment/invitation-tokens/${establishmentId}`);
        return response;
    },
    validateInvitationToken: async (invitationToken: string): Promise<any> => {
        const reponse = await apiFetch(`/api/invitation-token/validate`, {
          method: "POST",
          body: JSON.stringify({ token: invitationToken }),
        });
        return reponse as any;
      },
};