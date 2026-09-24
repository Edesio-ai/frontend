import { apiFetch } from "@/lib/api-client";
import type { EstablishmentStatsResponse } from "@/types";

export const establishmentService = {
  async getEstablishmentStats(): Promise<EstablishmentStatsResponse> {
    const response = await apiFetch<EstablishmentStatsResponse>("/api/establishment/stats");
    return response;
  },
};
