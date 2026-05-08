import { apiFetch } from "@/lib/api-client";
import { Student } from "@/types";

export const studentService = {
    uploadPhoto: async (file: File): Promise<{ photoUrl: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiFetch<{ photoUrl: string }>(`/api/student/photo`, {
            method: "POST",
            body: formData,
        });
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
    getStudentsByIds: async (studentIds: string[]): Promise<Student[]> => {
        const response = await apiFetch<Student[]>(`/api/student/batch`, {
            method: "POST",
            body: JSON.stringify({ studentIds }),
        });
        return response;
    },
};