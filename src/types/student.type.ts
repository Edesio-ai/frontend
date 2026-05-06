export interface Student {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface StudentSession {
  id: string;
  studentId: string;
  sessionId: string;
  joinedAt: string;
}

export interface StudentCourseStats {
  id: string;
  studentId: string;
  courseId: string;
  attemptedQuestions: number;
  correctAnswers: number;
  lastAttempt: string;
  createdAt: string;
}

export interface UpdateOrCreateStudentCourseStats {
  attemptedQuestions: number;
  correctAnswers: number;
}
export type InsertStudentSession = Omit<StudentSession, "id" | "joinedAt">;

export interface SessionStudent extends Omit<Student, "createdAt" | "supabaseUserId"> {
  joinedAt: string;
}