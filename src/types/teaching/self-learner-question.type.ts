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