import { apiFetch } from "@/lib/api-client";
import { JoinedSession, Student } from "@/types";

export const studentService = {
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