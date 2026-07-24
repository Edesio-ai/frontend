export interface GenerateCompletionFeedbackRequest {
  courseTitle: string;
  score: number;
  total: number;
  studentName?: string;
  /** Course/session language — feedback is generated in this language. */
  language?: "francais" | "anglais" | "espagnol" | "allemand";
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
}
