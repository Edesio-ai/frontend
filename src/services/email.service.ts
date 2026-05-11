import { apiFetch } from "@/lib/api-client";

export const emailService = {
    async sendInvitationEmail(body: { invitedEmail: string, establishmentName: string, invitationToken: string, assignedChatbots: number }): Promise<{ success: boolean }> {
        const response = await apiFetch("/api/email/send-invitation", {
            method: "POST",
            body: JSON.stringify(body),
        });
        return response as { success: boolean };
    },
}