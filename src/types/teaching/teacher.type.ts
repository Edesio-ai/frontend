import { SessionWithStudentCount } from "./session.type";


export interface Teacher {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
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