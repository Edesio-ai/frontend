import { apiFetch } from "@/lib/api-client";
import { SelfLearnerCourseFile } from "@/types";

export const selfLearnerCourseFileService = {
  async uploadPdfForCourse(coursId: string, file: File): Promise<{ data: SelfLearnerCourseFile }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiFetch<{ data: SelfLearnerCourseFile }>(
      `/api/self-learner-course-file/self-learner-course/${coursId}`,
      {
        method: "POST",
        body: formData,
      },
    );
    return response;
  },

  async getSelfLearnerCourseFiles(courseId: string): Promise<SelfLearnerCourseFile[]> {
    const response = await apiFetch<SelfLearnerCourseFile[]>(
      `/api/self-learner-course-file/self-learner-course/${courseId}`,
      {
        method: "GET",
      },
    );
    return response;
  },
  async deleteSelfLearnerCourseFile(fileId: string): Promise<void> {
    const response = await apiFetch<void>(`/api/self-learner-course-file/${fileId}`, {
      method: "DELETE",
    });
    return response;
  },
  async getSelfLearnerCourseFileSignedUrl(fileId: string): Promise<{ signedUrl: string }> {
    const response = await apiFetch<{ signedUrl: string }>(`/api/self-learner-course-file/${fileId}/signed-url`, {
      method: "GET",
    });
    return response;
  },
};
