import { CheckoutUrlResponse } from "@/types";
import { authenticatedRequest } from "../http/authenticated-request";
import { GetStripeUrlInput } from "./schema";
import { ApiResponse } from "@/types/teaching/global.type";
import { getCsrfToken } from "../http/cookies";

export const getStripeUrl = async (body: GetStripeUrlInput): Promise<ApiResponse<CheckoutUrlResponse>> => {
  return authenticatedRequest<CheckoutUrlResponse>("/billing/checkout-session", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": await getCsrfToken(),
    },
  });
};
