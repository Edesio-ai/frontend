import { apiFetch } from "@/lib/api-client";
import { Teacher } from "@/types";

export const teacherService = {
  createTeacher: async (name: string, email: string): Promise<Teacher | null> => {
    const reponse = await apiFetch(`/api/teacher/`, {
      method: "POST",
      body: JSON.stringify({ name, email }),
    });
    return reponse as Teacher | null;
  },
  
  fetchTeacher: async (): Promise<{ teacher: Teacher}> => {
    const reponse = await apiFetch<{ teacher: Teacher}>(`/api/teacher/`, {
      method: "GET",
    });
    return reponse;
  },
}