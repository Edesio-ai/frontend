import { apiFetch } from "@/lib/api-client";
import { JoinedSession, SessionStudent, Student } from "@/types";

export const studentService = {
    getSessionStudents: async (sessionId: string): Promise<SessionStudent[]> => {
        const response = await apiFetch<SessionStudent[]>(`/api/student/session/${sessionId}`);
        return response;
    },
    getStudent: async (): Promise<Student> => {
        const response = await apiFetch<Student>(`/api/student`);
        return response;
    },
    createStudent: async (): Promise<Student | null> => {
        const response = await apiFetch<Student>(`/api/student`, {
            method: "POST",
        });
        return response;
    },
    getJoinedSessions: async (studentId: string): Promise<JoinedSession[]> => {
        const response = await apiFetch<JoinedSession[]>(`/api/student/${studentId}/joined-sessions`);
        return response;
    },
    joinSessionByCode: async (code: string): Promise<void> => {
        await apiFetch<void>(`/api/student/join-session/${code}`, {
            method: "POST",
        });
    },
};