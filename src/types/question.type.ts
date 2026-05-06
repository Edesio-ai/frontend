export interface GenerateQuestionsConfig {
    totalQuestions?: number;
    simpleCount?: number;
    openedCount?: number;
}

export interface EvaluateAnswerRequest {
    questionText: string;
    correctAnswer: string;
    answer: string;
    explanation: string;
}

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

export interface QuestionCourse {
  id: string;
  courseId: string;
  studentId: string;
  questionText: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}