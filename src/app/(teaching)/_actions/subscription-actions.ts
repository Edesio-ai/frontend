"use server";

import { getSubscriptionStatus } from "@/server/billing/subscription";
import type { SubscriptionStatus } from "@/types";
import type { ApiResponse } from "@/types/teaching/global.type";

export async function getSubscriptionStatusAction(): Promise<ApiResponse<SubscriptionStatus>> {
  return getSubscriptionStatus();
}
