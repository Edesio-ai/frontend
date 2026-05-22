import { QuestionType } from "./question.type";

export interface SelfLearnerQuestion {
    id: string;
    courseId: string;
    type: QuestionType;
    question: string;
    propositions: string[] | null;
    correctAnswer: string | null;
    correctAnswers: string[] | null;
    explication: string | null;
    createdAt: string;
}