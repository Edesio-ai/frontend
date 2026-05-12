import { apiFetch } from "@/lib/api-client";
import { CourseFile } from "@/types";

export const CoursefileService = {
  deleteFile: async (fileId: string): Promise<void> => {
    const response = await apiFetch<void>(`/api/file/${fileId}`, {
      method: "DELETE",
    });
    return response;
  },
  uploadFile: async (courseId: string, file: File): Promise<{ data: CourseFile }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch<{ data: CourseFile }>(`/api/course-file/course/${courseId}`, {
      method: "POST",
      body: formData,
    });

    return response;
  },
  getCoursesFiles: async (courseId: string): Promise<CourseFile[]> => {
    const response = await apiFetch<CourseFile[]>(`/api/course-file/course/${courseId}`);
    return response;
  },
}