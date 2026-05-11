export interface Student {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
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
