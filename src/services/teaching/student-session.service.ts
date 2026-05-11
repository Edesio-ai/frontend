import { apiFetch } from "@/lib/api-client";
import { JoinedSession, StudentSessionWithStudent } from "@/types";

export const studentSessionService = {
    getJoinedSessions: async (studentId: string): Promise<JoinedSession[]> => {
        const response = await apiFetch<JoinedSession[]>(`/api/student-session/student/${studentId}/joined-sessions`);
        return response;
    },
    joinSessionByCode: async (code: string): Promise<void> => {
        await apiFetch<void>(`/api/student-session/join-session/${code}`, {
            method: "POST",
        });
    },
    getStudentSession: async (sessionId: string): Promise<StudentSessionWithStudent[]> => {
        const response = await apiFetch<StudentSessionWithStudent[]>(`/api/student-session/session/${sessionId}`);
        return response;
    },
    deleteStudentSession: async (sessionId: string): Promise<void> => {
        await apiFetch<void>(`/api/student-session/session/${sessionId}`, {
            method: "DELETE",
        });
    },
};