import { apiFetch } from "@/lib/api-client";
import { QuestionCourse } from "@/types";

export const courseQuestionService = {
  getAnsweredQuestionsCourse: async (): Promise<{ answeredQuestions: number }> => {
    const response = await apiFetch<{ answeredQuestions: number }>(`/api/course-question/answered/`);
    return response;
  },
  getPendingQuestionsCount: async (sessionId: string): Promise<{ count: number }> => {
    const response = await apiFetch<{ count: number }>(`/api/course-question/pending/${sessionId}`);
    return response;
  },
  getStudentCourseQuestions: async (courseId: string): Promise<QuestionCourse[]> => {
    const response = await apiFetch<QuestionCourse[]>(`/api/course-question/course/${courseId}`);
    return response;
},
}