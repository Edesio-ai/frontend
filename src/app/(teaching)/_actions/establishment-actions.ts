"use server";

import { getEstablishmentDashboard } from "@/server/establishment";
import type { EstablishmentDashboard } from "@/types/teaching/establishment.type";
import type { ApiResponse } from "@/types/teaching/global.type";

export async function getEstablishmentDashboardAction(): Promise<ApiResponse<EstablishmentDashboard>> {
  return getEstablishmentDashboard();
}
