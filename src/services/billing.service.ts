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
    async cancelSubscription(): Promise<any> {
        const response = await apiFetch<void>("/api/billing/subscription/cancel", {
          method: "POST",
        });
        return response;
    },
    async reactivateSubscription(): Promise<any> {
        const response = await apiFetch<void>("/api/billing/subscription/reactivate", {
          method: "POST",
        });
        return response;
    },
    async getCustomerPortalUrl(): Promise<{ url: string }> {
        const response = await apiFetch<{ url: string }>("/api/billing/portal", {
          method: "GET",
        });
        return response;
    },
}