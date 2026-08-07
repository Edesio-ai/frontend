"use client";

import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { exportService } from "@/services/export.service";
import { invitationTokenService } from "@/services/invitation-token.service";
import { llmService } from "@/services/llm.service";
import { CoursefileService } from "@/services/teaching/course-file.service";
import { courseQuestionService } from "@/services/teaching/course-question.service";
import { courseService } from "@/services/teaching/course.service";
import { questionService } from "@/services/teaching/question.service";
import { sessionService } from "@/services/teaching/session.service";
import { courseStudentStatsService } from "@/services/teaching/student-course-stats.service";
import { studentSessionService } from "@/services/teaching/student-session.service";
import { teacherService } from "@/services/teaching/teacher.service";
import {
  AnswerCourseQuestionBody,
  Course,
  CourseFile,
  CourseQuestion,
  CourseRanking,
  CreateQuestionRequest,
  GenerateQuestionsConfig,
  InsertCourse,
  InsertSession,
  Language,
  Question,
  Session,
  StudentSessionWithStudent,
  Teacher,
  TeacherWithEstablishment,
  UpdateCourseRequest,
  UpdateQuestionRequest,
  ValidateInvitationTokenResponse,
} from "@/types";
import { generateUniqueSessionCode } from "@/utils/functions/session.utils";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface TeacherContextType {
  teacher: Teacher | null;
  sessions: Session[];
  loading: boolean;
  error: string | null;
  handleFetchTeacher: () => Promise<Teacher>;
  handleInvitationValidation: (invitationToken: string) => Promise<ValidateInvitationTokenResponse | undefined>;
  handleCreateTeacher: (name: string, email: string) => Promise<Teacher | null>;
  fetchOrCreateTeacher: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  createSession: (name: string, language: Language) => Promise<Session | null>;
  handleUpdateSessionName: (sessionId: string, name: string) => Promise<Session>;
  updateSession: (sessionId: string, name: string) => Promise<Session>;
  handleDeleteSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  fetchCourses: (sessionId: string) => Promise<Course[]>;
  updateCourse: (
    courseId: string,
    title: string,
    description: string | null,
    contentText: string | null,
  ) => Promise<Course | null>;
  handleGetCoursesCount: (sessionId: string) => Promise<number>;
  handleCreateCourse: (coursData: InsertCourse) => Promise<Course>;
  handleUploadPdfForCours: (courseId: string, file: File) => Promise<CourseFile>;
  uploadPdfForCourse: (courseId: string, file: File) => Promise<CourseFile>;
  fetchCourseFiles: (courseId: string) => Promise<CourseFile[]>;
  deleteCourseFile: (fileId: CourseFile) => Promise<boolean>;
  getPdfUrl: (fileId: string, fileName: string) => Promise<void>;
  fetchQuestions: (courseId: string) => Promise<Question[]>;
  updateQuestion: (questionId: string, updates: UpdateQuestionRequest) => Promise<Question | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  createQuestion: (courseId: string, questionData: Omit<CreateQuestionRequest, "courseId">) => Promise<Question | null>;
  generateQuestions: (
    courseId: string,
    config?: GenerateQuestionsConfig,
  ) => Promise<{
    success: boolean;
    questionCount?: number;
    questions?: Question[];
    error?: string;
  }>;
  validateQuestions: (courseId: string) => Promise<{ success: boolean; course?: Course; error?: string }>;
  fetchSessionStudents: (sessionId: string) => Promise<StudentSessionWithStudent[]>;
  fetchCourseRanking: (courseId: string) => Promise<CourseRanking[]>;
  fetchQuestionsCourseForCourse: (courseId: string) => Promise<CourseQuestion[]>;
  fetchPendingQuestionsCount: (sessionId: string) => Promise<number>;
  answerCourseQuestion: (courseQuestionId: string, answer: string) => Promise<CourseQuestion | null>;
  deleteCourseQuestion: (courseQuestionId: string) => Promise<boolean>;
  reorderCourse: (coursIds: string[]) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  reorderQuestions: (questionIds: string[]) => Promise<boolean>;
  createCourse: (
    sessionId: string,
    title: string,
    description: string,
    contentText: string,
    pdfFiles?: File[],
  ) => Promise<Course | null>;
  refreshSessions: () => Promise<void>;
}

const TeacherContext = createContext<TeacherContextType | null>(null);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTeacher = useCallback(async (): Promise<Teacher> => {
    try {
      const { teacher } = await teacherService.fetchTeacher();
      return teacher;
    } catch (error) {
      console.error("Error fetching teacher:", error);
      setError(t.hooks.teacher.error);
      setLoading(false);
      throw error;
    }
  }, [t]);

  const handleInvitationValidation = useCallback(
    async (invitationToken: string): Promise<ValidateInvitationTokenResponse | undefined> => {
      try {
        const response = await invitationTokenService.validateInvitationToken(invitationToken);
        return response;
      } catch (err) {
        console.error("Error validating invitation token:", err);
      }
    },
    [],
  );

  const handleCreateTeacher = useCallback(
    async (name: string, email: string): Promise<Teacher | null> => {
      try {
        const response = await teacherService.createTeacher(name, email);
        return response;
      } catch (err) {
        console.error("Error creating teacher:", err);
        setError(t.hooks.teacher.error);
        setLoading(false);
        return null;
      }
    },
    [t],
  );
  const fetchOrCreateTeacher = useCallback(async (): Promise<void> => {
    if (!user) {
      setTeacher(null);
      setLoading(false);
      return;
    }

    const teacher = await handleFetchTeacher();

    if (teacher) {
      setTeacher(teacher);
      const invitationToken = user.metadata?.invitationToken;
      const teacherWithEstab: TeacherWithEstablishment = teacher;
      if (invitationToken && !teacherWithEstab.establishmentId) {
        await handleInvitationValidation(invitationToken);
      }
    } else {
      const name =
        user.metadata?.firstname && user.metadata?.lastname
          ? `${user.metadata.firstname} ${user.metadata.lastname}`
          : user.metadata?.firstname || "Professeur";

      const invitationToken = user.metadata?.invitationToken;

      const newTeacher = await handleCreateTeacher(name, user.email || "");

      if (invitationToken && newTeacher) {
        await handleInvitationValidation(invitationToken);
        setTeacher(newTeacher);
      }
    }
    setLoading(false);
  }, [user, handleFetchTeacher, handleInvitationValidation, handleCreateTeacher]);

  const fetchSessions = useCallback(async () => {
    if (!teacher) {
      setSessions([]);
      return;
    }

    try {
      const sessions = await sessionService.getSessions();
      setSessions(sessions || []);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t.hooks.teacher.error);
    }
  }, [teacher, t]);

  const handleCreateSession = useCallback(
    async (sessionData: InsertSession): Promise<Session> => {
      try {
        return await sessionService.insertSession(sessionData);
      } catch (err) {
        console.error("Error creating session:", err);
        setError(t.hooks.teacher.error);
        throw err;
      }
    },
    [t],
  );

  const createSession = useCallback(
    async (name: string, language: Language = "francais"): Promise<Session | null> => {
      if (!teacher) return null;

      try {
        const code = await generateUniqueSessionCode();

        const sessionData: InsertSession = {
          teacherId: teacher.id,
          name,
          code,
          language,
        };
        const session: Session = await handleCreateSession(sessionData);

        setSessions((prev) => [session, ...prev]);
        setError(null);
        return session;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return null;
      }
    },
    [teacher, handleCreateSession, t],
  );

  const handleUpdateSessionName = useCallback(
    async (sessionId: string, name: string): Promise<Session> => {
      try {
        if (!teacher) {
          throw new Error("Teacher not found");
        }
        const { session } = await sessionService.updateSessionName(sessionId, name, teacher.id);
        return session;
      } catch (err) {
        console.error("Error updating session:", err);
        setError(t.hooks.teacher.sessionUpdateError);
        throw err;
      }
    },
    [teacher, t],
  );

  const updateSession = useCallback(
    async (sessionId: string, name: string): Promise<Session> => {
      if (!teacher) throw new Error("Teacher not found");

      try {
        const data = await handleUpdateSessionName(sessionId, name);

        setSessions((prev) => prev.map((s) => (s.id === sessionId ? data : s)));
        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        throw err;
      }
    },
    [teacher, handleUpdateSessionName, t],
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        await sessionService.deleteSession(sessionId);
      } catch (err) {
        console.error("Error deleting session courses:", err);
        setError(t.hooks.teacher.sessionDeleteError);
        throw err;
      }
    },
    [t],
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!teacher) return false;

      try {
        await handleDeleteSession(sessionId);

        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return false;
      }
    },
    [teacher, handleDeleteSession, t],
  );

  const fetchCourses = useCallback(
    async (sessionId: string): Promise<Course[]> => {
      try {
        const courses = await courseService.getSessionCourses(sessionId);

        setError(null);
        return courses || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return [];
      }
    },
    [t],
  );

  const updateCourse = useCallback(
    async (
      courseId: string,
      title: string,
      description: string | null,
      contentText: string | null,
    ): Promise<Course | null> => {
      try {
        const body: UpdateCourseRequest = {
          title,
          description,
          contentText,
        };
        const { data } = await courseService.updateCourse(courseId, body);

        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return null;
      }
    },
    [t],
  );

  const handleGetCoursesCount = async (sessionId: string): Promise<number> => {
    try {
      const { coursesCount } = await courseService.getCourseSessionCount(sessionId);
      return coursesCount;
    } catch (err) {
      console.error("Error counting cours:", err);
      throw err;
    }
  };

  const handleCreateCourse = useCallback(
    async (coursData: InsertCourse): Promise<Course> => {
      try {
        const { data } = await courseService.createCourse(coursData);
        return data;
      } catch (err) {
        console.error("Error creating course:", err);
        setError(t.hooks.teacher.courseCreateError);
        throw err;
      }
    },
    [t],
  );

  const handleUploadPdfForCours = useCallback(
    async (courseId: string, file: File): Promise<CourseFile> => {
      try {
        const { data } = await CoursefileService.uploadFile(courseId, file);
        return data;
      } catch (err) {
        console.error("Error uploading PDF:", err);
        setError(t.hooks.teacher.uploadError);
        throw err;
      }
    },
    [t],
  );

  const uploadPdfForCourse = useCallback(
    async (courseId: string, file: File): Promise<CourseFile> => {
      try {
        const fileData = await handleUploadPdfForCours(courseId, file);
        return fileData;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.uploadError);
        throw err;
      }
    },
    [handleUploadPdfForCours, t],
  );

  const fetchCourseFiles = useCallback(async (courseId: string): Promise<CourseFile[]> => {
    try {
      const fileData = await CoursefileService.getCoursesFiles(courseId);

      return fileData;
    } catch (err) {
      console.error("Unexpected error:", err);
      return [];
    }
  }, []);

  const createCourse = useCallback(
    async (
      sessionId: string,
      title: string,
      description: string,
      contentText: string,
      pdfFiles?: File[],
    ): Promise<Course | null> => {
      try {
        const count = await handleGetCoursesCount(sessionId);

        const MAX_COURS_PER_SESSION = 50;

        if (count !== null && count >= MAX_COURS_PER_SESSION) {
          setError(`Vous avez atteint la limite de ${MAX_COURS_PER_SESSION} cours par session.`);
          return null;
        }

        const coursData: InsertCourse = {
          sessionId: sessionId,
          title,
          description: description || null,
          contentText: contentText || null,
        };

        const course = await handleCreateCourse(coursData);

        if (pdfFiles && pdfFiles.length > 0 && course) {
          for (const pdfFile of pdfFiles) {
            await uploadPdfForCourse(course.id, pdfFile);
          }
        }

        setError(null);
        return course;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return null;
      }
    },
    [uploadPdfForCourse, handleCreateCourse, t],
  );

  const deleteCourseFile = useCallback(
    async (file: CourseFile): Promise<boolean> => {
      try {
        await CoursefileService.deleteFile(file.id);

        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return false;
      }
    },
    [t],
  );

  const getPdfUrl = useCallback(
    async (fileId: string, fileName: string): Promise<void> => {
      try {
        await exportService.exportCourseFilePdf(fileId, fileName);
      } catch (err) {
        console.error("Error getting PDF URL:", err);
        setError(t.hooks.teacher.error);
      }
    },
    [t],
  );

  const fetchQuestions = useCallback(async (courseId: string): Promise<Question[]> => {
    try {
      const questionsData = await questionService.getCourseQuestions(courseId);

      return questionsData;
    } catch (err) {
      console.error("Unexpected error in fetchQuestions:", err);
      return [];
    }
  }, []);

  const updateQuestion = useCallback(
    async (questionId: string, updates: UpdateQuestionRequest): Promise<Question | null> => {
      try {
        const { question } = await questionService.updateQuestion(questionId, updates);

        setError(null);
        return question;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.questionUpdateError);
        return null;
      }
    },
    [t],
  );

  const deleteQuestion = useCallback(
    async (questionId: string): Promise<boolean> => {
      try {
        await questionService.deleteQuestion(questionId);

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.questionDeleteError);
        return false;
      }
    },
    [t],
  );

  const createQuestion = useCallback(
    async (courseId: string, questionData: Omit<CreateQuestionRequest, "courseId">): Promise<Question | null> => {
      try {
        const body: CreateQuestionRequest = {
          courseId,
          ...questionData,
        };
        const { data: question } = await questionService.createQuestion(body);

        setError(null);
        return question;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.questionCreateError);
        return null;
      }
    },
    [t],
  );

  const generateQuestions = useCallback(
    async (
      courseId: string,
      config?: GenerateQuestionsConfig,
    ): Promise<{ success: boolean; questionCount?: number; questions?: Question[]; error?: string }> => {
      try {
        const { questions, questionCount } = await llmService.generateQuestions(courseId, config);

        return {
          success: true,
          questionCount,
          questions,
        };
      } catch (err) {
        console.error("Error generating questions:", err);
        return { success: false, error: t.hooks.teacher.generateError };
      }
    },
    [t],
  );

  const validateQuestions = useCallback(
    async (courseId: string): Promise<{ success: boolean; course?: Course; error?: string }> => {
      try {
        const { data } = await courseService.validateQuestions(courseId);

        return {
          success: true,
          course: data,
        };
      } catch (err) {
        console.error("Error validating questions:", err);
        return { success: false, error: t.hooks.teacher.validateError };
      }
    },
    [t],
  );

  const fetchSessionStudents = useCallback(async (sessionId: string): Promise<StudentSessionWithStudent[]> => {
    try {
      const studentsSessions = await studentSessionService.getStudentSession(sessionId);

      return studentsSessions;
    } catch (err) {
      console.error("Unexpected error:", err);
      return [];
    }
  }, []);

  const fetchCourseRanking = useCallback(async (courseId: string): Promise<CourseRanking[]> => {
    try {
      const rankingData = await courseStudentStatsService.getCourseRanking(courseId);

      return rankingData;
    } catch (err) {
      console.error("Unexpected error:", err);
      return [];
    }
  }, []);

  const fetchQuestionsCourseForCourse = useCallback(async (courseId: string): Promise<CourseQuestion[]> => {
    try {
      const questionsData = await courseQuestionService.getCourseQuestions(courseId);
      return questionsData;
    } catch (err) {
      console.error("Unexpected error:", err);
      return [];
    }
  }, []);

  const fetchPendingQuestionsCount = useCallback(async (sessionId: string): Promise<number> => {
    try {
      const { count } = await courseQuestionService.getPendingQuestionsCount(sessionId);
      return count || 0;
    } catch (err) {
      console.error("Unexpected error:", err);
      return 0;
    }
  }, []);

  const answerCourseQuestion = useCallback(
    async (courseQuestionId: string, answer: string): Promise<CourseQuestion | null> => {
      try {
        const body: AnswerCourseQuestionBody = {
          courseQuestionId,
          answer,
        };
        const data = await courseQuestionService.answerCourseQuestion(body);

        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.answerError);
        return null;
      }
    },
    [t],
  );

  const deleteCourseQuestion = useCallback(
    async (courseQuestionId: string): Promise<boolean> => {
      try {
        await courseQuestionService.deleteCourseQuestion(courseQuestionId);
        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return false;
      }
    },
    [t],
  );

  const reorderCourse = useCallback(
    async (coursIds: string[]): Promise<boolean> => {
      try {
        for (const [index, coursId] of coursIds.entries()) {
          await courseService.updateCourse(coursId, { positionOrder: index + 1 });
        }
        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return false;
      }
    },
    [t],
  );

  const deleteCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        await courseService.deleteCourse(courseId);

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.courseDeleteError);
        return false;
      }
    },
    [t],
  );

  const reorderQuestions = useCallback(
    async (questionIds: string[]): Promise<boolean> => {
      try {
        const updates = questionIds.map((id, index) => ({
          id,
          position_order: index,
        }));

        for (const update of updates) {
          await updateQuestion(update.id, { positionOrder: update.position_order });
        }

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.teacher.error);
        return false;
      }
    },
    [t, updateQuestion],
  );

  useEffect(() => {
    if (!authLoading) {
      fetchOrCreateTeacher();
    }
  }, [authLoading, fetchOrCreateTeacher]);

  useEffect(() => {
    if (teacher) {
      fetchSessions();
    }
  }, [teacher, fetchSessions]);

  const value: TeacherContextType = {
    teacher,
    sessions,
    loading: loading || authLoading,
    error,
    handleFetchTeacher,
    handleInvitationValidation,
    handleCreateTeacher,
    fetchOrCreateTeacher,
    fetchSessions,
    createSession,
    updateSession,
    handleDeleteSession,
    deleteSession,
    fetchCourses,
    updateCourse,
    handleGetCoursesCount,
    handleCreateCourse,
    handleUploadPdfForCours,
    uploadPdfForCourse,
    fetchCourseFiles,
    getPdfUrl,
    fetchQuestions,
    updateQuestion,
    deleteQuestion,
    createQuestion,
    generateQuestions,
    validateQuestions,
    fetchSessionStudents,
    fetchCourseRanking,
    fetchQuestionsCourseForCourse,
    fetchPendingQuestionsCount,
    answerCourseQuestion,
    deleteCourseQuestion,
    reorderCourse,
    deleteCourse,
    reorderQuestions,
    handleUpdateSessionName,
    deleteCourseFile,
    createCourse,
    refreshSessions: fetchSessions,
  };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error("useTeacher must be used within TeacherProvider");
  }
  return context;
}
