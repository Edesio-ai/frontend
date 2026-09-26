"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import type {
  CourseBasic,
  Establishment,
  InvitationToken,
  Student,
  SessionDetails,
  TeacherWithStats,
  EstablishmentStats,
} from "@/types";
import { generateInvitationCode } from "@/utils/functions/establishment.utils";
import { invitationTokenService } from "@/services/invitation-token.service";
import { sessionService } from "@/services/teaching/session.service";
import { studentService } from "@/services/teaching/student.service";
import { courseService } from "@/services/teaching/course.service";
import { studentSessionService } from "@/services/teaching/student-session.service";
import { emailService } from "@/services/email.service";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api-error";
import { runAuthenticatedAction } from "@/lib/auth/run-authenticated-action";
import { deleteTeacherAction, getEstablishmentDashboardAction } from "../../_actions/establishment-actions";

interface EstablishmentContextType {
  establishment: Establishment | null;
  teachers: TeacherWithStats[];
  invitationTokens: InvitationToken[];
  stats: EstablishmentStats;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createInvitationToken: (
    invitedEmail: string,
    expiresInDays?: number,
    assignedChatbots?: number,
  ) => Promise<boolean | null>;
  deleteInvitationToken: (tokenId: string) => Promise<boolean>;
  getStudentSessions: (sessionId: string) => Promise<Student[]>;
  getSessionCourse: (sessionId: string) => Promise<CourseBasic[]>;
  getSessionDetails: (courseId: string) => Promise<SessionDetails | null>;
  deleteTeacher: (teacherId: string) => Promise<boolean>;
}

const EstablishmentContext = createContext<EstablishmentContextType | null>(null);

export function EstablishmentProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [teachers, setTeachers] = useState<TeacherWithStats[]>([]);
  const [invitationTokens, setInvitationTokens] = useState<InvitationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EstablishmentStats>({
    totalTeachers: 0,
    totalSessions: 0,
    totalStudents: 0,
  });

  const fetchEtablissementData = useCallback(async () => {
    if (!user) {
      setEstablishment(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await runAuthenticatedAction(getEstablishmentDashboardAction, logout);
      if (!response) return;

      if (!response.ok) {
        setError(t.hooks.establishment.error);
        return;
      }

      setEstablishment(response.data.establishment);
      setTeachers(response.data.teachers);
      setStats(response.data.stats);
      setError(null);
    } catch {
      setError(t.hooks.establishment.error);
    } finally {
      setLoading(false);
    }
  }, [user, logout, t]);

  const fetchInvitationTokens = useCallback(async () => {
    if (!establishment) {
      setInvitationTokens([]);
      return;
    }

    try {
      const tokens = await invitationTokenService.getEstablishmentInvitationTokens(establishment.id);
      setInvitationTokens(tokens);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t.hooks.establishment.error);
    }
  }, [establishment, t]);

  const createInvitationToken = useCallback(
    async (invitedEmail: string, expiresInDays: number = 7, assignedChatbots: number = 0): Promise<boolean | null> => {
      if (!establishment) return null;
      if (!invitedEmail || !invitedEmail.includes("@")) {
        return null;
      }
      try {
        const token = generateInvitationCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const body = {
          establishmentId: establishment.id,
          token,
          invitedEmail: invitedEmail.toLowerCase().trim(),
          expiresAt: expiresAt.toISOString(),
          assignedChatbots,
        };

        const { success } = await invitationTokenService.createInvitationToken(body);

        if (!success) {
          throw new ApiError(t.hooks.establishment.invitationError);
        }

        const sendInvitationBody = {
          invitedEmail: invitedEmail.toLowerCase().trim(),
          establishmentName: establishment.name,
          invitationToken: token,
          assignedChatbots,
          locale,
        };

        const response: { success: boolean } = await emailService.sendInvitationEmail(sendInvitationBody);

        if (!response.success) {
          throw new ApiError(t.hooks.establishment.invitationError);
        }

        await fetchInvitationTokens();
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        if (err instanceof ApiError) {
          throw err;
        }
        throw new ApiError(t.hooks.establishment.invitationError);
      }
    },
    [establishment, fetchInvitationTokens, locale, t],
  );

  const deleteInvitationToken = useCallback(
    async (tokenId: string): Promise<boolean> => {
      const { success } = await invitationTokenService.deleteInvitationToken(tokenId);

      if (!success) {
        setError(t.hooks.establishment.invitationError);
        throw new Error("Error while deleting invitation token");
      }

      await fetchInvitationTokens();
      return success;
    },
    [fetchInvitationTokens, t],
  );

  const getStudentSessions = useCallback(async (sessionId: string): Promise<Student[]> => {
    try {
      const studentsSessions = await studentSessionService.getStudentSession(sessionId);
      const studentIds = studentsSessions.map((studentSession) => studentSession.id);
      return await studentService.getStudentsByIds(studentIds);
    } catch (err) {
      console.error("Unexpected error:", err);
      return [];
    }
  }, []);

  const getSessionCourse = useCallback(async (sessionId: string): Promise<CourseBasic[]> => {
    const courses = await courseService.getSessionCourses(sessionId);
    return (courses || []).map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      validatedQuestions: course.validatedQuestions ?? false,
    }));
  }, []);

  const getSessionDetails = useCallback(async (courseId: string): Promise<SessionDetails | null> => {
    const { data } = await sessionService.getSessionDetails(courseId);
    return data || null;
  }, []);

  const deleteTeacher = useCallback(
    async (teacherId: string): Promise<boolean> => {
      try {
        const response = await runAuthenticatedAction(() => deleteTeacherAction({ teacherId }), logout);
        if (!response?.ok) return false;
        setTeachers((state) => state.filter((teacher) => teacher.id !== teacherId));
        return true;
      } catch {
        return false;
      }
    },
    [logout],
  );

  const refreshData = useCallback(async () => {
    await fetchEtablissementData();
    if (establishment) {
      await fetchInvitationTokens();
    }
  }, [fetchEtablissementData, establishment, fetchInvitationTokens]);

  useEffect(() => {
    if (!authLoading && user) {
      void fetchEtablissementData();
    }
  }, [authLoading, user, fetchEtablissementData]);

  useEffect(() => {
    if (establishment) {
      void fetchInvitationTokens();
    }
  }, [establishment, fetchInvitationTokens]);

  const value: EstablishmentContextType = {
    establishment,
    teachers,
    invitationTokens,
    stats,
    loading: loading || authLoading,
    error,
    refreshData,
    createInvitationToken,
    deleteInvitationToken,
    getStudentSessions,
    getSessionCourse,
    getSessionDetails,
    deleteTeacher,
  };

  return <EstablishmentContext.Provider value={value}>{children}</EstablishmentContext.Provider>;
}

export function useEstablishment() {
  const context = useContext(EstablishmentContext);
  if (!context) {
    throw new Error("useEstablishment must be used within EstablishmentProvider");
  }
  return context;
}
