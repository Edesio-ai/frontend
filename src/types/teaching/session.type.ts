import { Course } from "./course.type";
import { CourseFile } from "./course-file.type";
import { Question } from "./question.type";
import { Student } from "./student.type";

export interface Session {
    id: string;
    teacherId: string;
    name: string;
    code: string;
    language: Language;
    createdAt: string;
}



export type Language = 'francais' | 'anglais' | 'espagnol' | 'allemand';

export interface SessionWithStudentCount extends Session {
    studentsCount: number;
    teacherName?: string;
}

export type InsertSession = Omit<Session, "id" | "createdAt">;

export interface SessionDetails {
    course: Partial<Pick<Course, 'id' | 'title' | 'description' | 'contentText' | 'validatedQuestions'>>;
    questions: (Pick<Question, 'id' | 'questionText'> & Partial<Pick<Question, 'type' | 'proposals' | 'correctAnswers'>>)[];
    students: (Pick<Student, 'id' | 'name'> & Partial<Pick<Student, 'email' | 'photoUrl'>> & {
        correctAnswers: number;
        totalAnswers: number;
    })[];
    files: Partial<Pick<CourseFile, 'id' | 'fileName'>>[];
}