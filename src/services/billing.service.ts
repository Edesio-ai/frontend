import { apiFetch } from "@/lib/api-client";

export const BillingService = {
    async getSubscriptionStatus(): Promise<any> {
        const response = await apiFetch("/api/billing/subscription-status");
        return response;
    },
    async getStripeUrl(priceId: string, planType: string): Promise<any> {
        const response = await apiFetch("/api/billing/checkout-url", {
            method: "POST",
            body: JSON.stringify({ priceId, planType }),
        });
        return response;
    },
    async getSubscription(): Promise<any> {
        const response = await apiFetch("/api/billing/subscription", {
            method: "GET",
        });
        return response;
    },
}