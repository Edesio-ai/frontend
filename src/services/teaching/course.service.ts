import { apiFetch } from "@/lib/api-client";
import { Course, CourseFile, InsertCourse, UpdateCourseRequest } from "@/types";

export const courseService = {
  updateCourse: async (courseId: string, body: UpdateCourseRequest): Promise<{data: Course }> => {
    const response = await apiFetch<{ data: Course }>(`/api/course/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return response;
  },
  createCourse: async (body: InsertCourse): Promise<{data: Course }> => {
    const response = await apiFetch<{ data: Course }>(`/api/course`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return response;
  },
  getCourseValidatedQuestions: async (courseId: string): Promise<{ validatedQuestions: boolean }> => {
    const response = await apiFetch<{ validatedQuestions: boolean }>(`/api/course/${courseId}/validated-questions`);
    return response;
  },
  deleteCourse: async (courseId: string): Promise<void> => {
    const response = await apiFetch<void>(`/api/course/${courseId}`, {
      method: "DELETE",
    });
    return response;
  },
  validateQuestions: async (courseId: string): Promise<{ data: Course }> => {
    const response = await apiFetch<{ data: Course }>(`/api/course/${courseId}/validate-questions`, {
      method: "POST",
    });
    return response;
  },
  getCourseSessionCount: async (
    sessionId: string,
  ): Promise<{ coursesCount: number }> => {
    const reponse = await apiFetch<{ coursesCount: number }>(`/api/course/session/${sessionId}/count`);

    return reponse;
  },
  getSessionCourses: async (sessionId: string): Promise<Course[]> => {
    const reponse = await apiFetch<Course[]>(`/api/course/session/${sessionId}`);

    return reponse;
  },
}