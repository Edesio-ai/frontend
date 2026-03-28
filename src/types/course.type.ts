export interface Course {
    id: string;
    session_id: string;
    titre: string;
    description: string | null;
    contenu_texte: string | null;
    questions_validees?: boolean;
    position_ordre?: number;
    created_at: string;
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
    bonne_reponse: string | null;
    bonnes_reponses: string[] | null;
    explication: string | null;
    position_ordre?: number;
    created_at: string;
}

export type QuestionType = 'single' | 'multiple' | 'open';

export interface CourseQuestion {
    id: string;
    cours_id: string;
    eleve_id: string;
    question: string;
    reponse: string | null;
    repondu_at: string | null;
    created_at: string;
    eleve_nom?: string;
}

export type InsertCours = Omit<Course, "id" | "created_at" | "questions_validees" | "position_ordre">;

export interface CoursRanking {
    eleve_id: string;
    nom: string;
    photo_url: string | null;
    questions_tentees: number;
    reponses_correctes: number;
    taux_reussite: number;
    rang: number;
    derniere_tentative: string;
}