import { Language } from "./index";

export interface GenerateCompletionFeedbackRequest {
  courseTitle: string;
  score: number;
  total: number;
  studentName?: string;
  /** Course/session language — feedback is generated in this language. */
  language?: Language;
}

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
  language?: Language;
}
