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

export type TeacherStatus = "active" | "invited";

export type EstablishmentTeacherListItem = {
  id: string;
  name: string;
  email: string;
  sessionsCount: number;
  studentsCount: number;
  status: TeacherStatus;
  source: "teacher" | "invitation";
};

export interface TeacherWithEstablishment extends Teacher {
  establishmentId?: string | null;
}
