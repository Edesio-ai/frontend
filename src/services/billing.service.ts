import { apiFetch } from "@/lib/api-client";

export const BillingService = {
    async getSubscriptionStatus(): Promise<any> {
        const response = await apiFetch("/api/billing/subscription-status");
        return response;
    },
}