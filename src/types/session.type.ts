export interface Session {
    id: string;
    teacherId: string;
    name: string;
    code: string;
    language: SessionLanguage;
    createdAt: string;
}

export interface JoinedSession extends Session {
    joinedAt: string;
}

export type SessionLanguage = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export interface SessionWithStudentCount extends Session {
    studentsCount: number;
    teacherName?: string;
}

export type InsertSession = Omit<Session, "id" | "createdAt">;

export interface SessionParticipant {
    studentId: string;
    name: string;
    email: string;
    photoUrl: string | null;
    joinedAt: string;
}
