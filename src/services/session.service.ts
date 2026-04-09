import { apiFetch } from "@/lib/api-client";
import { InsertSession, Session } from "@/types";

export const sessionService = {
    getSessions: async (): Promise<Session[]> => {
        const reponse = await apiFetch<Session[]>(`/api/teacher/sessions`, {
          method: "GET",
        });
        return reponse;
    },
    getSessionByCode: async (code: string): Promise<{session:Session}> => {
        const reponse = await apiFetch<{session: Session}>(`/api/teacher/sessions/${code}`, {
          method: "GET",
        });
        return reponse;
    },
    insertSession: async (sessionData: InsertSession): Promise<Session> => {
        const reponse = await apiFetch<Session>(`/api/teacher/sessions`, {
          method: "POST",
          body: JSON.stringify(sessionData),
        });
        return reponse;
    },
    updateSessionName: async (sessionId: string, name: string, teacherId: string): Promise<{ session: Session }> => {
      const reponse = await apiFetch<{ session: Session }>(`/api/teacher/sessions/update/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify({ name, teacherId }),
      });
      return reponse;
    },
}