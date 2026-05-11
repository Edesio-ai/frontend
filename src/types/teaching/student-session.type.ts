import { Session } from "./session.type";
import { Student } from "./student.type";

export interface JoinedSession extends Session {
    joinedAt: string;
}

export interface StudentSession {
    id: string;
    studentId: string;
    sessionId: string;
    joinedAt: string;
}


export interface StudentSessionWithStudent extends Omit<Student, "createdAt" | "supabaseUserId"> {
    joinedAt: string;
}

export type InsertStudentSession = Omit<StudentSession, "id" | "joinedAt">;