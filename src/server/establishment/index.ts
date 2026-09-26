import type { EstablishmentDashboard } from "@/types/teaching/establishment.type";
import type { ApiResponse } from "@/types/teaching/global.type";
import { authenticatedRequest } from "../http/authenticated-request";
import { establishmentDashboardSchema } from "./schema";
import { getCsrfToken } from "../http/cookies";
import type { CreateInvitationToken } from "@/types/teaching/establishment.type";

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

export const deleteTeacher = async (teacherId: string): Promise<ApiResponse<void>> => {
  return authenticatedRequest<void>(`/teacher/${teacherId}`, {
    method: "DELETE",
    headers: {
      "x-csrf-token": await getCsrfToken(),
    },
  });
};

export const sendTeacherInvitation = async (
  input: CreateInvitationToken,
): Promise<ApiResponse<{ success: boolean }>> => {
  return authenticatedRequest<{ success: boolean }>("/invitation-token", {
    method: "POST",
    headers: {
      "x-csrf-token": await getCsrfToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
};
