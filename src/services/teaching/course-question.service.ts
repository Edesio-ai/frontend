import { apiFetch } from "@/lib/api-client";
import { AnswerCourseQuestionBody, CourseQuestion, SendCourseQuestionBody } from "@/types";

export const courseQuestionService = {
  getAnsweredQuestionsCourse: async (): Promise<{ answeredQuestions: number }> => {
    const response = await apiFetch<{ answeredQuestions: number }>(`/api/course-question/answered/`);
    return response;
  },
  getPendingQuestionsCount: async (sessionId: string): Promise<{ count: number }> => {
    const response = await apiFetch<{ count: number }>(`/api/course-question/pending/${sessionId}`);
    return response;
  },
  getCourseQuestions: async (courseId: string): Promise<CourseQuestion[]> => {
    const response = await apiFetch<CourseQuestion[]>(`/api/course-question/course/${courseId}`);
    return response;
},
  sendCourseQuestion: async (body: SendCourseQuestionBody ): Promise<CourseQuestion> => {
    const response = await apiFetch<CourseQuestion>(`/api/course-question/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response;
  },
  answerCourseQuestion: async (body: AnswerCourseQuestionBody): Promise<CourseQuestion> => {
    const response = await apiFetch<CourseQuestion>(`/api/course-question/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return response;
  },
  deleteCourseQuestion: async (courseQuestionId: string): Promise<void> => {
    await apiFetch<void>(`/api/course-question/${courseQuestionId}`, {
      method: "DELETE",
    });
  },
}