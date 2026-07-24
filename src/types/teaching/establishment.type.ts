import type { TeacherWithStats } from "./teacher.type";

export interface Establishment {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface EstablishmentStats {
  totalTeachers: number;
  totalSessions: number;
  totalStudents: number;
}

export interface EstablishmentStatsResponse {
  establishment: Establishment;
  teachers: TeacherWithStats[];
  stats: EstablishmentStats;
}
