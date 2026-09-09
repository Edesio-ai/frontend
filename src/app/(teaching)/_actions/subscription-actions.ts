"use server";

import { getSubscriptionStatus } from "@/server/billing/subscription";
import { ApiResponse } from "@/types/teaching/global.type";
import { SubscriptionStatus } from "@/types";

export async function getSubscriptionStatusAction(): Promise<ApiResponse<SubscriptionStatus>> {
  return await getSubscriptionStatus();
}
