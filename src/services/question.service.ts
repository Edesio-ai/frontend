import { apiFetch } from "@/lib/api-client";
import { Question } from "@/types/course.type";

export const questionService = {
  getPendingQuestionsCount: async (sessionId: string): Promise<{ count: number }> => {
    const response = await apiFetch<{ count: number }>(`/api/question/pending/${sessionId}`);
    return response;
  },
  getCourseQuestions: async (courseId: string): Promise<Question[]> => {
    const response = await apiFetch<Question[]>(`/api/question/course/${courseId}`);
    return response;
  },
};