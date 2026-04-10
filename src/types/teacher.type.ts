import { SessionWithStudentCount } from "./session.type";


export interface Teacher {
  id: string;
  supabase_user_id: string;
  nom: string;
  email: string;
  created_at: string;
}

export interface TeacherWithStats {
  id: string;
  name: string;
  email: string;
  created_at: string;
  sessions_count: number;
  students_count: number;
  sessions: SessionWithStudentCount[];
}