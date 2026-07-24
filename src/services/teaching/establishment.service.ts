import { apiFetch } from "@/lib/api-client";
import type { Establishment, EstablishmentStatsResponse } from "@/types";

export const establishmentService = {
  async getEstablishmentStats(): Promise<EstablishmentStatsResponse> {
    const response = await apiFetch<EstablishmentStatsResponse>("/api/establishment/stats");
    return response;
  },
  async createEstablishment(supabaseUserId: string, name: string, email: string): Promise<Establishment> {
    const body = {
      supabaseUserId,
      name,
      email,
    };
    const response = await apiFetch<Establishment>("/api/establishment/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
};
