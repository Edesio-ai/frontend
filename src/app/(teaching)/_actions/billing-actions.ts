"use server";

import { getStripeUrl } from "@/server/billing/stripe";
import { getStripeUrlSchema, type GetStripeUrlInput } from "@/server/billing/schema";
import type { CheckoutUrlResponse } from "@/types";
import type { ApiResponse } from "@/types/teaching/global.type";

export async function getStripeUrlAction(body: GetStripeUrlInput): Promise<ApiResponse<CheckoutUrlResponse>> {
  const parsed = getStripeUrlSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      status: 400,
    };
  }

  return getStripeUrl(parsed.data);
}
