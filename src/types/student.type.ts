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

export type InsertStudent = Omit<Student, "id" | "createdAt" | "photoUrl"> & { photoUrl?: string | null };
export type InsertStudentSession = Omit<StudentSession, "id" | "joinedAt">;
