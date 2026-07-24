import { apiFetch } from "@/lib/api-client";
import { CreateManualQuestionRequest, SelfLearnerQuestion, UpdateQuestion } from "@/types";

export const selfLearnerQuestionService = {
  getSelfLearnerQuestions: async (courseId: string): Promise<SelfLearnerQuestion[]> => {
    const response = await apiFetch<SelfLearnerQuestion[]>(
      `/api/self-learner-question/self-learner-course/${courseId}`,
      {
        method: "GET",
      },
    );
    return response;
  },
  createSelfLearnerQuestion: async (
    courseId: string,
    data: CreateManualQuestionRequest,
  ): Promise<SelfLearnerQuestion> => {
    const response = await apiFetch<SelfLearnerQuestion>(`/api/self-learner-question/self-learner-course/${courseId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },
  updateSelfLearnerQuestion: async (questionId: string, data: UpdateQuestion): Promise<SelfLearnerQuestion> => {
    const response = await apiFetch<SelfLearnerQuestion>(`/api/self-learner-question/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response;
  },
  deleteSelfLearnerQuestion: async (questionId: string): Promise<void> => {
    const response = await apiFetch<void>(`/api/self-learner-question/${questionId}`, {
      method: "DELETE",
    });
    return response;
  },
};
