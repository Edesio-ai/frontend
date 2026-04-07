export interface Course {
    id: string;
    session_id: string;
    titre: string;
    description: string | null;
    contenu_texte: string | null;
    questions_validated?: boolean;
    position_order?: number;
    created_at: string;
}

export type CourseRanking  = {
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
    fichier_url: string;
    nom_fichier: string;
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

export type InsertCourse = Omit<Course, "id" | "created_at" | "questions_validated" | "position_order">;

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