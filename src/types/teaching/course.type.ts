import { Question } from "./question.type";
import { Student } from "./student.type";

export interface Course {
  id: string;
  sessionId: string;
  title: string;
  description: string | null;
  contentText: string | null;
  validatedQuestions?: boolean;
  positionOrder?: number;
  createdAt?: string;
}

export interface CourseBasic {
  id: string;
  title: string;
  description: string | null;
  validatedQuestions: boolean;
}

export type CourseRanking = {
  studentId: string;
  name: string;
  photoUrl: string | null;
  attemptedQuestions: number;
  correctAnswers: number;
  successRate: number;
  rank: number;
  lastAttempt: string;
};

export interface CourseFile {
  id: string;
  courseId: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

export interface CourseQuestion {
  id: string;
  courseId: string;
  studentId: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  studentName?: string;
}

export type InsertCourse = Omit<
  Course,
  "id" | "createdAt" | "validatedQuestions" | "positionOrder"
>;

export interface CourseDetails {
  course: Partial<Pick<Course, 'id' | 'title' | 'description' | 'contentText' | 'validatedQuestions'>>;
  questions: (Pick<Question, 'id' | 'questionText'> & Partial<Pick<Question, 'type' | 'proposals' | 'correctAnswers'>>)[];
  students: (Pick<Student, 'id' | 'name'> & Partial<Pick<Student, 'email' | 'photoUrl'>> & {
    correctAnswers: number;
    totalAnswers: number;
  })[];
  files: Partial<Pick<CourseFile, 'id' | 'fileName'>>[];
}

export type UpdateCourseRequest = {
  title?: string;
  description?: string | null;
  contentText?: string | null;
  positionOrder?: number;
};