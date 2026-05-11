export interface CourseQuestion {
    id: string;
    courseId: string;
    studentId: string;
    questionText: string;
    answer: string | null;
    answeredAt: string | null;
    createdAt: string;
    studentName?: string;
  }