import { SubscriptionStatus } from "@/types";
import { authenticatedBackendFetch } from "../http/backend";
import { ApiResponse } from "@/types/teaching/global.type";

export async function getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
  const response = await authenticatedBackendFetch("/billing/subscription-status", {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    return { ok: false, code: error.code, message: error.message };
  }

  const data = await response.json();
  return { ok: true, data };
}
