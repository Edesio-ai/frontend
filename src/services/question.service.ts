import { apiFetch } from "@/lib/api-client";

export const questionService = {
  getPendingQuestionsCount: async (sessionId: string): Promise<{ count: number }> => {
    const response = await apiFetch<{ count: number }>(`/api/question/pending/${sessionId}`);
    return response;
  },
};