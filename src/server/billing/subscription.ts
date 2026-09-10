import { SubscriptionStatus } from "@/types";
import { authenticatedRequest } from "../http/authenticated-request";
import { ApiResponse } from "@/types/teaching/global.type";

export async function getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
  return authenticatedRequest<SubscriptionStatus>("/billing/subscription-status", {
    method: "GET",
  });
}
