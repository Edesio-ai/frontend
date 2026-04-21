import { apiFetch } from "@/lib/api-client";
import { Question } from "@/types/course.type";
import { GenerateQuestionsConfig } from "@/types/question.type";

export const questionService = {
  getPendingQuestionsCount: async (sessionId: string): Promise<{ count: number }> => {
    const response = await apiFetch<{ count: number }>(`/api/question/pending/${sessionId}`);
    return response;
  },
  getCourseQuestions: async (courseId: string): Promise<Question[]> => {
    const response = await apiFetch<Question[]>(`/api/question/course/${courseId}`);
    return response;
  },
  generateQuestions: async (courseId: string, config?: GenerateQuestionsConfig): Promise<{questionCount: number, questions: Question[]}> => {
    const body = {
      courseId,
      ...config,
    }
    
    const response = await apiFetch<{ questionCount: number, questions: Question[]}>(`/api/question/generate/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
};