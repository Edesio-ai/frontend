import { apiFetch } from "@/lib/api-client";
import { UpdateOrCreateStudentCourseStats } from "@/types";
import { CourseRanking } from "@/types";

export const courseStudentStatsService = {
    getCourseRanking: async (courseId: string): Promise<CourseRanking[]> => {
        const response = await apiFetch<CourseRanking[]>(`/api/student-course-stats/course/${courseId}/ranking`);
        return response;
    },
    updateOrCreateStudentCourseStats: async (courseId: string, body: UpdateOrCreateStudentCourseStats): Promise<void> => {
        await apiFetch<void>(`/api/student-course-stats/course/${courseId}`, {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    
}