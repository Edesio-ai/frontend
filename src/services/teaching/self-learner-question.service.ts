import { apiFetch } from "@/lib/api-client";
import { CreateManualQuestionRequest, SelfLearnerQuestion } from "@/types";

export const selfLearnerQuestionService = {
    getSelfLearnerQuestions: async (courseId: string): Promise<SelfLearnerQuestion[]> => {
        const response = await apiFetch<SelfLearnerQuestion[]>(`/api/self-learner-question/self-learner-course/${courseId}`, {
            method: "GET",
        });
        return response;
    },
    createSelfLearnerQuestion: async (courseId: string, data: CreateManualQuestionRequest): Promise<SelfLearnerQuestion> => {
        const response = await apiFetch<SelfLearnerQuestion>(`/api/self-learner-question/self-learner-course/${courseId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    },
}