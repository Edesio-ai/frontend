export interface Course {
    id: string;
    sessionId: string;
    title: string;
    description: string | null;
    contentText: string | null;
    validatedQuestions?: boolean;
    positionOrder?: number;
    created_at: string;
}

export interface CourseBasic {
    id: string;
    title: string;
    description: string | null;
    validatedQuestions: boolean;
}

export type CourseRanking = {
    student_id: string;
    name: string;
    photo_url: string | null;
    attempted_questions: number;
    correct_answers: number;
    success_rate: number;
    rank: number;
    last_attempt: string;
}

export interface CourseFile {
    id: string;
    cours_id: string;
    fileUrl: string;
    fileName: string;
    created_at: string;
}

export interface Question {
    id: string;
    cours_id: string;
    type: QuestionType;
    question: string;
    propositions: string[] | null;
    good_answer: string | null;
    good_answers: string[] | null;
    explication: string | null;
    position_ordre?: number;
    created_at: string;
}

export type QuestionType = 'single' | 'multiple' | 'open';

export interface CourseQuestion {
    id: string;
    course_id: string;
    student_id: string;
    question: string;
    answer: string | null;
    answered_at: string | null;
    created_at: string;
    student_name?: string;
}

export type InsertCourse = Omit<Course, "id" | "created_at" | "validatedQuestions" | "positionOrder">;

export interface CoursRanking {
    student_id: string;
    name: string;
    photo_url: string | null;
    attempted_questions: number;
    correct_answers: number;
    success_rate: number;
    rank: number;
    last_attempt: string;
}

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
        question: string;
        type: QuestionType;
        good_answer: string;
        proposals: string[] | null;
    }[];
    students: {
        id: string;
        name: string;
        email: string;
        photo_url: string | null;
        correct_answers: number;
        total_answers: number;
    }[];
    files: {
        id: string;
        name: string;
    }[];
}