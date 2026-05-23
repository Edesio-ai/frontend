import { apiFetch } from "@/lib/api-client";
import { InsertSelfLearnerCourse, SelfLearnerCourse, UpdateSelfLearnerCourse } from "@/types";

export const selfLearnerCourseService = {
    async createSelfLearnerCourse(coursData: InsertSelfLearnerCourse): Promise<SelfLearnerCourse> {
        const response = await apiFetch<SelfLearnerCourse>("/api/self-learner-course", {
            method: "POST",
            body: JSON.stringify(coursData),
        });
        return response;
    },
    async getSelfLearnerCoursesCount(): Promise<{ count: number }> {
        const response = await apiFetch<{ count: number }>("/api/self-learner-course/count");
        return response;
    },
    async getSelfLearnerCourses(): Promise<SelfLearnerCourse[]> {
        const response = await apiFetch<SelfLearnerCourse[]>("/api/self-learner-course");
        return response;
    },
    async updateSelfLearnerCourse(courseId: string, courseData: UpdateSelfLearnerCourse): Promise<SelfLearnerCourse> {
        const response = await apiFetch<SelfLearnerCourse>(`/api/self-learner-course/${courseId}`, {
            method: "PATCH",
            body: JSON.stringify(courseData),
        });
        return response;
    }
}