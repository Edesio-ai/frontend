import { apiFetch } from "@/lib/api-client";
import { Session, Teacher } from "@/types";

export const teacherService = {
  createTeacher: async (name: string, email: string): Promise<Teacher | null> => {
    const reponse = await apiFetch(`/api/teacher/`, {
      method: "POST",
      body: JSON.stringify({ name, email }),
    });
    return reponse as Teacher | null;
  },
  
  fetchTeacher: async (): Promise<Teacher> => {
    const reponse = await apiFetch<Teacher>(`/api/teacher/`, {
      method: "GET",
    });
    return reponse;
  },
  validateInvitationToken: async (invitationToken: string): Promise<any> => {
    const reponse = await apiFetch(`/api/teacher/validate-invitation`, {
      method: "POST",
      body: JSON.stringify({ token: invitationToken }),
    });
    return reponse as any;
  },
  getSessions: async (): Promise<Session[]> => {
    const reponse = await apiFetch(`/api/teacher/sessions`, {
      method: "GET",
    });
    return reponse as Session[];
  }
}