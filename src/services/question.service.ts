import { apiFetch } from "@/lib/api-client";
import { CreateQuestionRequest, EvaluateAnswerRequest, GenerateQuestionsConfig, Question, QuestionCourse, UpdateQuestionRequest } from "@/types/question.type";

export const questionService = {
  getAnsweredQuestionsCourse: async (): Promise<{ answeredQuestions: number }> => {
    const response = await apiFetch<{ answeredQuestions: number }>(`/api/question/answered/`);
    return response;
  },
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
  evaluateAnswer: async (body: EvaluateAnswerRequest): Promise<{ score: number, isCheating: boolean, feedback: string, missingElements: string[] }> => {
    const response = await apiFetch<{ score: number, isCheating: boolean, feedback: string, missingElements: string[] }>(`/api/question/evaluate-answer`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
};