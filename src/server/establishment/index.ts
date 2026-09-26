import type { EstablishmentDashboard } from "@/types/teaching/establishment.type";
import type { ApiResponse } from "@/types/teaching/global.type";
import { authenticatedRequest } from "../http/authenticated-request";
import { establishmentDashboardSchema } from "./schema";

export const getEstablishmentDashboard = async (): Promise<ApiResponse<EstablishmentDashboard>> => {
  const response = await authenticatedRequest<unknown>("/establishment/stats", {
    method: "GET",
  });

  if (!response.ok) return response;

  const parsed = establishmentDashboardSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error("Invalid establishment dashboard payload", parsed.error.issues);
    return {
      ok: false,
      code: "INVALID_RESPONSE",
      message: "Invalid establishment dashboard payload",
      status: 502,
    };
  }

  return { ok: true, data: parsed.data };
};
