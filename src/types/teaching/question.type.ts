export type QuestionType = "single" | "multiple" | "open";

export interface Question {
  id: string;
  courseId: string;
  type: QuestionType;
  questionText: string;
  proposals: string[];
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