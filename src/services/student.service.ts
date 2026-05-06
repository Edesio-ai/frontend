import { apiFetch } from "@/lib/api-client";
import { JoinedSession, QuestionCourse, SessionStudent, Student, UpdateOrCreateStudentCourseStats } from "@/types";

export const studentService = {
    getStudentQuestionsCourse: async (courseId: string): Promise<QuestionCourse[]> => {
        const response = await apiFetch<QuestionCourse[]>(`/api/student/course/${courseId}/questions`);
        return response;
    },
    updateOrCreateStudentCourseStats: async (courseId: string, body: UpdateOrCreateStudentCourseStats): Promise<void> => {
        await apiFetch<void>(`/api/student/course/${courseId}/stats`, {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    uploadPhoto: async (file: File): Promise<{ photoUrl: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiFetch<{ photoUrl: string }>(`/api/student/photo`, {
            method: "POST",
            body: formData,
        });
        return response;
    },
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
    getStudentsByIds: async (studentIds: string[]): Promise<Student[]> => {
        const response = await apiFetch<Student[]>(`/api/student/batch`, {
            method: "POST",
            body: JSON.stringify({ studentIds }),
        });
        return response;
    },
    deleteStudentSession: async (sessionId: string): Promise<void> => {
        await apiFetch<void>(`/api/student/session/${sessionId}`, {
            method: "DELETE",
        });
    },
};