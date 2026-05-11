import { apiFetch } from "@/lib/api-client";
import { Course, SessionDetails, InsertSession, Session } from "@/types";

export const sessionService = {
  getSessions: async (): Promise<Session[]> => {
    const reponse = await apiFetch<Session[]>(`/api/session`, {
      method: "GET",
    });
    return reponse ?? [];
  },
  getSessionByCode: async (code: string): Promise<{ session: Session }> => {
    const reponse = await apiFetch<{ session: Session }>(
      `/api/session/code/${code}`,
      {
        method: "GET",
      },
    );
    return reponse;
  },
  insertSession: async (sessionData: InsertSession): Promise<Session> => {
    const reponse = await apiFetch<Session>(`/api/session`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
    return reponse;
  },
  updateSessionName: async (
    sessionId: string,
    name: string,
    teacherId: string,
  ): Promise<{ session: Session }> => {
    const reponse = await apiFetch<{ session: Session }>(
      `/api/session/${sessionId}`,
      {
        method: "PUT",
        body: JSON.stringify({ name, teacherId }),
      },
    );
    return reponse;
  },
  deleteSession: async (sessionId: string): Promise<unknown> => {
    const reponse = await apiFetch<unknown>(`/api/session/${sessionId}`, {
      method: "DELETE",
    });
    return reponse;
  },
  getSessionDetails: async (courseId: string): Promise<{ data: SessionDetails}> => {
    const response = await apiFetch<{ data: SessionDetails }>(`/api/session/course/${courseId}/details`);
    return response;
  },
};
