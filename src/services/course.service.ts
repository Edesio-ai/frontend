import { apiFetch } from "@/lib/api-client";
import { Course, CourseFile, InsertCourse } from "@/types";

export const courseService = {
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
  }
}