import { apiFetch } from "@/lib/api-client";
import { CreateQuestionRequest, EvaluateAnswerRequest, GenerateQuestionsConfig, Question, QuestionCourse, UpdateQuestionRequest } from "@/types/question.type";

export const questionService = {
  getCourseQuestions: async (courseId: string): Promise<Question[]> => {
    const response = await apiFetch<Question[]>(`/api/question/course/${courseId}`);
    return response;
  },
  createQuestion: async (questionData: CreateQuestionRequest): Promise<{ data: Question }> => {
    const response = await apiFetch<{ data: Question }>(`/api/question`, {
      method: "POST",
      body: JSON.stringify(questionData),
    });
    return response;
  },
  deleteQuestion: async (questionId: string): Promise<void> => {
    const response = await apiFetch<void>(`/api/question/${questionId}`, {
      method: "DELETE",
    });
    return response;
  },
  updateQuestion: async (questionId: string, updates: UpdateQuestionRequest): Promise<{ question: Question | null }> => {
    const response = await apiFetch<{ question: Question | null }>(`/api/question/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return response;
  },
};