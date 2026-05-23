import { apiFetch } from "@/lib/api-client";
import { SelfLearnerCourseFile } from "@/types";

export const selfLearnerCourseFileService = {
    async uploadPdfForCourse(coursId: string, file: File): Promise<{ data: SelfLearnerCourseFile }> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiFetch<{ data: SelfLearnerCourseFile }>(`/api/self-learner-course-file/self-learner-course/${coursId}`, {
            method: "POST",
            body: formData,
        });
        return response;
    }
}