export interface Session {
    id: string;
    teacher_id: string;
    nom: string;
    code: string;
    langue: SessionLanguage;
    created_at: string;
}

export type SessionLanguage = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export interface SessionWithStudentCount extends Session {
    students_count: number;
    teacher_nom?: string;
}

export type InsertSession = Omit<Session, "id" | "created_at">;

export interface SessionParticipant {
    eleve_id: string;
    nom: string;
    email: string;
    photo_url: string | null;
    joined_at: string;
}