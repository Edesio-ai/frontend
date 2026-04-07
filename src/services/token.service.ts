import { apiFetch } from "@/lib/api-client";

export const tokenService = {
    deleteInvitationToken: async (tokenId: string) => {
        return apiFetch<any>(`/api/token/delete/${tokenId}`, {
            method: "DELETE",
        });
    }
};