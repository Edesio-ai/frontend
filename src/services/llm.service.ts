import { apiFetch } from "@/lib/api-client";
import { GenerateCompletionFeedbackRequest } from "@/types/llm.type";
import { EvaluateAnswerRequest, GenerateQuestionsConfig, Question } from "@/types/question.type";

export const llmService = {
  generateCompletionFeedback: async (body: GenerateCompletionFeedbackRequest): Promise<{ feedback: string }> => {
    const response = await apiFetch<{ feedback: string }>(`/api/llm/completion-feedback`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
  generateQuestions: async (courseId: string, config?: GenerateQuestionsConfig): Promise<{questionCount: number, questions: Question[]}> => {
    const body = {
      courseId,
      ...config,
    }
    
    const response = await apiFetch<{ questionCount: number, questions: Question[]}>(`/api/llm/generate-questions`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
  evaluateAnswer: async (body: EvaluateAnswerRequest): Promise<{ score: number, isCheating: boolean, feedback: string, missingElements: string[] }> => {
    const response = await apiFetch<{ score: number, isCheating: boolean, feedback: string, missingElements: string[] }>(`/api/llm/evaluate-answer`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
}