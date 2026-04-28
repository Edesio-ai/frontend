import { apiFetch } from "@/lib/api-client";
import { Course, CourseDetails, CourseFile, CourseRanking, InsertCourse, UpdateCourseRequest } from "@/types";

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
  uploadFile: async (courseId: string, file: File): Promise<{data: CourseFile} > => {
    const formData = new FormData();  
    formData.append("file", file);

    const response = await apiFetch<{ data: CourseFile }>(`/api/course/${courseId}/file`, {
      method: "POST",
      body: formData,
    });

    return response;
  },
  getCoursesFiles: async (courseId: string): Promise<CourseFile[]> => {
    const response = await apiFetch<CourseFile[]>(`/api/course/${courseId}/file`);
    return response;
  },
  getCourseValidatedQuestions: async (courseId: string): Promise<{ validatedQuestions: boolean }> => {
    const response = await apiFetch<{ validatedQuestions: boolean }>(`/api/course/${courseId}/validated-questions`);
    return response;
  },
  getCourseRanking: async (courseId: string): Promise<CourseRanking[]> => {
    const response = await apiFetch<CourseRanking[]>(`/api/course/${courseId}/ranking`);
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
  getCourseDetails: async (courseId: string): Promise<{ data: CourseDetails}> => {
    const response = await apiFetch<{ data: CourseDetails }>(`/api/course/${courseId}/details`);
    return response;
  },
}