export interface Course {
  id: string;
  sessionId: string;
  title: string;
  description: string | null;
  contentText: string | null;
  validatedQuestions?: boolean;
  positionOrder?: number;
  createdAt?: string;
}

export interface CourseBasic {
  id: string;
  title: string;
  description: string | null;
  validatedQuestions: boolean;
}

export type CourseRanking = {
  studentId: string;
  name: string;
  photoUrl: string | null;
  attemptedQuestions: number;
  correctAnswers: number;
  successRate: number;
  rank: number;
  lastAttempt: string;
};

export type InsertCourse = Omit<
  Course,
  "id" | "createdAt" | "validatedQuestions" | "positionOrder"
>;

export type UpdateCourseRequest = {
  title?: string;
  description?: string | null;
  contentText?: string | null;
  positionOrder?: number;
};