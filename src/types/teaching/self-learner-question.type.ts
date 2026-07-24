import { QuestionType } from "./question.type";

export interface SelfLearnerQuestion {
  id: string;
  courseId: string;
  type: QuestionType;
  questionText: string;
  proposals: string[] | null;
  correctAnswers: string[] | null;
  explanation: string | null;
  createdAt: string;
}

export type CreateManualQuestionRequest = Pick<SelfLearnerQuestion, "type" | "questionText" | "correctAnswers"> & {
  proposals?: string[];
  explanation?: string;
};

export type UpdateQuestion = Pick<SelfLearnerQuestion, "questionText" | "correctAnswers">;
