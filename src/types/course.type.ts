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

export interface CourseFile {
  id: string;
  courseId: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

export type QuestionType = "single" | "multiple" | "open";

/** Aligné sur le domaine Nest (camelCase), comme `Question` côté API. */
export interface Question {
  id: string;
  courseId: string;
  type: QuestionType;
  questionText: string;
  proposals: unknown;
  correctAnswers: string[] | null;
  explanation: string | null;
  createdAt?: string;
  positionOrder?: number | null;
}

export interface CreateQuestionRequest {
  courseId: string;
  type: QuestionType;
  questionText: string;
  proposals?: string[];
  correctAnswers?: string[];
  explanation?: string | null;
}

export interface UpdateQuestionRequest {
  type?: QuestionType;
  questionText?: string;
  proposals?: string[];
  correctAnswers?: string[];
  explanation?: string | null;
  positionOrder?: number | null;
}

export interface CourseQuestion {
  id: string;
  courseId: string;
  studentId: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  studentName?: string;
}

export type InsertCourse = Omit<
  Course,
  "id" | "createdAt" | "validatedQuestions" | "positionOrder"
>;

export interface CourseDetails {
  course: {
    id: string;
    title: string;
    description: string | null;
    contentText: string | null;
    validatedQuestions: boolean;
  };
  questions: {
    id: string;
    questionText: string;
    type: QuestionType;
    proposals: unknown;
    correctAnswers?: string[] | null;
  }[];
  students: {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
    correctAnswers: number;
    totalAnswers: number;
  }[];
  files: {
    id: string;
    fileName: string;
  }[];
}

export type UpdateCourseRequest = {
  title?: string;
  description?: string | null;
  contentText?: string | null;
  positionOrder?: number;
};