import { apiFetch } from "@/lib/api-client";
import { CourseRanking } from "@/types/course.type";

export const courseStudentStatsService = {
    getCourseRanking: async (courseId: string): Promise<CourseRanking[]> => {
        const response = await apiFetch<CourseRanking[]>(`/api/course-student-stats/course/${courseId}/ranking`);
        return response;
    },
}