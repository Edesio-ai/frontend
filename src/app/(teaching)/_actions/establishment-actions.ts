"use server";

import { deleteTeacher, getEstablishmentDashboard } from "@/server/establishment";
import { deleteTeacherSchema } from "@/server/establishment/schema";
import type { DeleteTeacher, EstablishmentDashboard } from "@/types/teaching/establishment.type";
import type { ApiResponse } from "@/types/teaching/global.type";

export async function getEstablishmentDashboardAction(): Promise<ApiResponse<EstablishmentDashboard>> {
  return getEstablishmentDashboard();
}

export async function deleteTeacherAction(input: DeleteTeacher): Promise<ApiResponse<void>> {
  const parsed = deleteTeacherSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Invalid input",
      status: 400,
    };
  }

  return deleteTeacher(parsed.data.teacherId);
}
