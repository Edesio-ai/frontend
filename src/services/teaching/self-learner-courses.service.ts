import { apiFetch } from "@/lib/api-client";
import { SelfLearnerCourse } from "@/types";

export const selfLearnerCourseService = {
    async getSelfLearnerCourses(): Promise<SelfLearnerCourse[]> {
        const response = await apiFetch<SelfLearnerCourse[]>("/api/self-learner-course");
        return response;
    }
}