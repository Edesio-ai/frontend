import { apiFetch } from "@/lib/api-client";
import { GenerateCompletionFeedbackRequest } from "@/types/llm.type";

export const llmService = {
  generateCompletionFeedback: async (body: GenerateCompletionFeedbackRequest): Promise<{ feedback: string }> => {
    const response = await apiFetch<{ feedback: string }>(`/api/llm/completion-feedback`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
}