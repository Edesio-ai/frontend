import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { Course, CourseRanking, JoinedSession, Question, CourseQuestion, Student } from "@/types";
import { studentService } from "@/services/teaching/student.service";
import { questionService } from "@/services/teaching/question.service";
import { courseQuestionService } from "@/services/teaching/course-question.service";
import { courseService } from "@/services/teaching/course.service";
import { studentSessionService } from "@/services/teaching/student-session.service";
import { courseStudentStatsService } from "@/services/teaching/student-course-stats.service";


export function useStudent() {
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [joinedSessions, setJoinedSessions] = useState<JoinedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateStudent = useCallback(async () => {
    if (!user) {
      setStudent(null);
      setLoading(false);
      return;
    }

    try {
      const existingStudent = await studentService.getStudent();

      if (existingStudent) {
        setStudent(existingStudent);
      } else {
        const newStudent = await studentService.createStudent();
        setStudent(newStudent);
      }

      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchJoinedSessions = useCallback(async () => {
    if (!student) {
      setJoinedSessions([]);
      return;
    }

    try {
      const sessions = await studentSessionService.getJoinedSessions(student.id);

      setJoinedSessions(sessions);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
    }
  }, [student]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrCreateStudent();
    }
  }, [authLoading, fetchOrCreateStudent]);

  useEffect(() => {
    if (student) {
      fetchJoinedSessions();
    }
  }, [student, fetchJoinedSessions]);

  const joinSessionByCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté pour rejoindre une session." };
      }

      const normalizedCode = code.toUpperCase().trim();

      try {
        await studentSessionService.joinSessionByCode(normalizedCode);

        await fetchJoinedSessions();
        return { success: true };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student, joinedSessions, fetchJoinedSessions]
  );

  const fetchCourse = useCallback(
    async (sessionId: string): Promise<Course[]> => {
      try {
        const courses = await courseService.getSessionCourses(sessionId);

        return courses || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const fetchQuestions = useCallback(
    async (courseId: string): Promise<Question[]> => {
      try {
        const data = await questionService.getCourseQuestions(courseId);

        return data || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const leaveSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!student) return false;

      try {
        await studentSessionService.deleteStudentSession(sessionId);

        await fetchJoinedSessions();
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        return false;
      }
    },
    [student, fetchJoinedSessions]
  );

  const uploadProfilePhoto = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string; url?: string }> => {
      if (!student || !user) {
        return { success: false, error: "Vous devez être connecté." };
      }

      try {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const allowedTypes = ["jpg", "jpeg", "png", "gif", "webp"];

        if (!fileExt || !allowedTypes.includes(fileExt)) {
          return { success: false, error: "Format d'image non supporté. Utilisez JPG, PNG, GIF ou WebP." };
        }

        if (file.size > 5 * 1024 * 1024) {
          return { success: false, error: "L'image est trop volumineuse (max 5 Mo)." };
        }

        const uploadedPhoto = await studentService.uploadPhoto(file);

        setStudent((prev) => prev ? { ...prev, photoUrl: uploadedPhoto.photoUrl } : null);

        return { success: true, url: uploadedPhoto.photoUrl };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student, user]
  );

  const updateCourseProgress = useCallback(
    async (
      coursId: string,
      attemptedQuestions: number,
      correctAnswers: number
    ): Promise<{ success: boolean; error?: string }> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté." };
      }

      try {
        const body = {
          attemptedQuestions,
          correctAnswers,
        }
        await courseStudentStatsService.updateOrCreateStudentCourseStats(coursId, body);

        return { success: true };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student]
  );

  const fetchCourseRanking = useCallback(
    async (coursId: string): Promise<CourseRanking[]> => {
      if (!student) return [];

      try {
        const ranking = await courseStudentStatsService.getCourseRanking(coursId);

        return ranking;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    [student]
  );

  const sendCourseQuestion = useCallback(
    async (courseId: string, questionText: string): Promise<{ success: boolean; error?: string; question?: CourseQuestion }> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté." };
      }

      if (!questionText.trim()) {
        return { success: false, error: "La question ne peut pas être vide." };
      }

      try {
        const body = {
          courseId,
          questionText: questionText.trim(),
        }
        const data = await courseQuestionService.sendCourseQuestion(body);

        return { success: true, question: data };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student]
  );

  const fetchQuestionsCoursForCours = useCallback(
    async (coursId: string): Promise<CourseQuestion[]> => {
      try {

        const data = await courseQuestionService.getCourseQuestions(coursId);

        return data || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const countAnsweredQuestionsForCourse = useCallback(
    async (): Promise<number> => {
      if (!student) return 0;

      try {
        const data = await courseQuestionService.getAnsweredQuestionsCourse()

        return data.answeredQuestions || 0;
      } catch (err) {
        console.error("Unexpected error:", err);
        return 0;
      }
    },
    [student]
  );

  return {
    student,
    joinedSessions,
    loading: loading || authLoading,
    error,
    joinSessionByCode,
    fetchCourse,
    fetchQuestions,
    leaveSession,
    refreshSessions: fetchJoinedSessions,
    uploadProfilePhoto,
    updateCourseProgress,
    fetchCourseRanking,
    sendCourseQuestion,
    fetchQuestionsCoursForCours,
    countAnsweredQuestionsForCourse,
  };
}
