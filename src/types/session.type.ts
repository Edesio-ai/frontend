export interface Session {
    id: string;
    teacherId: string;
    name: string;
    code: string;
    language: SessionLanguage;
    created_at: string;
}

export type SessionLanguage = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export interface SessionWithStudentCount extends Session {
    students_count: number;
    teacher_nom?: string;
}

export type InsertSession = Omit<Session, "id" | "created_at">;

export interface SessionParticipant {
    studentId: string;
    name: string;
    email: string;
    photoUrl: string | null;
    joinedAt: string;
}