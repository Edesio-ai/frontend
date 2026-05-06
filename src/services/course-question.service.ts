import { apiFetch } from "@/lib/api-client";

export const courseQuestionService = {
    getAnsweredQuestionsCourse: async (): Promise<{ answeredQuestions: number }> => {
        const response = await apiFetch<{ answeredQuestions: number }>(`/api/question/answered/`);
        return response;
      },
      getPendingQuestionsCount: async (sessionId: string): Promise<{ count: number }> => {
        const response = await apiFetch<{ count: number }>(`/api/question/pending/${sessionId}`);
        return response;
      },
}