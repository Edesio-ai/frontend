import { Language } from "./session.type";

export type SelfLearnerCourse = {
    id: string;
    selfLearnerId: string;
    title: string;
    description: string | null;
    contentText: string | null;
    language: Language;
    createdAt: string;
}

export type InsertSelfLearnerCourse = Omit<SelfLearnerCourse, "id" | "createdAt" | "selfLearnerId">;