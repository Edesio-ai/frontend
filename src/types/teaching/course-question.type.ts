export interface CourseQuestion {
  id: string;
  courseId: string;
  studentId: string;
  questionText: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  studentName?: string;
}

export interface SendCourseQuestionBody extends Pick<CourseQuestion, "courseId" | "questionText"> {}

export interface AnswerCourseQuestionBody extends Pick<CourseQuestion, "answer"> {
  courseQuestionId: string;
}