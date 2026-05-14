import { SessionWithStudentCount } from "./session.type";


export interface Teacher {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
  establishmentId?: string | null;
}

export interface TeacherWithStats {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  sessionsCount: number;
  studentsCount: number;
  sessions: SessionWithStudentCount[];
}

export interface TeacherWithEstablishment extends Teacher {
  establishmentId?: string | null;
}