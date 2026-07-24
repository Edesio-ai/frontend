import { apiFetch } from "@/lib/api-client";
import type { CheckoutUrlResponse, SubscriptionResponse, SubscriptionStatus } from "@/types";

export const BillingService = {
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await apiFetch<SubscriptionStatus>("/api/billing/subscription-status");
    return response;
  },
  async getStripeUrl(priceId: string, planType: string, locale: "en" | "fr" = "fr"): Promise<CheckoutUrlResponse> {
    const response = await apiFetch<CheckoutUrlResponse>("/api/billing/checkout-url", {
      method: "POST",
      body: JSON.stringify({ priceId, planType, locale }),
    });
    return response;
  },
  async getSubscription(): Promise<SubscriptionResponse> {
    const response = await apiFetch<SubscriptionResponse>("/api/billing/subscription", {
      method: "GET",
    });
    return response;
  },
  async cancelSubscription(): Promise<Record<string, unknown> | null> {
    const response = await apiFetch<Record<string, unknown> | null>("/api/billing/subscription/cancel", {
      method: "POST",
    });
    return response;
  },
  async reactivateSubscription(): Promise<{ success: boolean }> {
    const response = await apiFetch<{ success: boolean }>("/api/billing/subscription/reactivate", {
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
};
