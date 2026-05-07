import { apiFetch } from "@/lib/api-client";

export const establishmentService = {
    async getEstablishmentStats(): Promise<any> {
        const response = await apiFetch("/api/establishment/stats");
        return response;
    },
    async createEstablishment(supabaseUserId: string, name: string, email: string): Promise<any> {
        const body = {
            supabaseUserId,
            name,
            email,
        }
        const response = await apiFetch("/api/establishment/create", {
            method: "POST",
            body: JSON.stringify(body),
        });
        return response;
    },

    async createInvitationToken(body: { establishmentId: string, token: string, invitedEmail: string, expiresAt: string, assignedChatbots: number }): Promise<any> {
        const response = await apiFetch("/api/establishment/invitation-tokens/create", {
            method: "POST",
            body: JSON.stringify(body),
        });

        return response;
    },

    async sendInvitationEmail(body: { invitedEmail: string, establishmentName: string, invitationToken: string, assignedChatbots: number }): Promise<{ success: boolean }> {
        const response = await apiFetch("/api/establishment/invitation-email/send", {
            method: "POST",
            body: JSON.stringify(body),
        });
        return response as { success: boolean };
    },
}