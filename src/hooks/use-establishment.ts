import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

import type {
  Establishment,
  InvitationToken,
  TeacherWithStats,
  Student,
  CourseDetails
} from "@/types";
import { establishmentService } from "@/services/establishment.service";
import { generateInvitationCode } from "@/utils/functions/establishment.utils";
import { invitationTokenService } from "@/services/invitation-token.service";
import { sessionService } from "@/services/session.service";
import { studentService } from "@/services/student.service";
import { courseService } from "@/services/course.service";
import { studentSessionService } from "@/services/student-session.service";
import { emailService } from "@/services/email.service";

interface EtablissementStats {
  totalTeachers: number;
  totalSessions: number;
  totalStudents: number;
}

export function useEstablishment() {
  const { user, loading: authLoading } = useAuth();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [teachers, setTeachers] = useState<TeacherWithStats[]>([]);
  const [invitationTokens, setInvitationTokens] = useState<InvitationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<EtablissementStats>({
    totalTeachers: 0,
    totalSessions: 0,
    totalStudents: 0,
  });

  const insertEstablishment = async (name: string) => {
    try {
      const establishment = await establishmentService.createEstablishment(user?.id || "", name, user?.email || "");
      setEstablishment(establishment);
      setStats({ totalTeachers: 0, totalSessions: 0, totalStudents: 0 });
      setTeachers([]);
      return establishment;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Merci de réessayer.";
      console.error("Error creating establishment:", message);
      setError("Erreur lors de la création du profil établissement");
    }
  }

  const getEstablishmentStats = async () => {
    try {
      const response = await establishmentService.getEstablishmentStats();
      setEstablishment(response.establishment);
      setTeachers(response.teachers);
      setStats(response.stats);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Merci de réessayer.";
      if (message.includes("Establishment not found")) {
        if (user) {
          const name = user.metadata?.establishment ||
            (user.metadata?.firstname && user.metadata?.lastname
              ? `${user.metadata.firstname} ${user.metadata.lastname}`
              : "Établissement");
  
          await insertEstablishment(name);
          return
        }
      }
      setError(message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  const fetchEtablissementData = useCallback(async () => {
    if (!user) {
      setEstablishment(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    await getEstablishmentStats();
  }, [user]);

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
      setError("Erreur lors du chargement des codes d'invitation.");
    }
  }, [establishment]);

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
          }

          const { success } = await invitationTokenService.createInvitationToken(body);

          if(!success) {
            const message = "Une erreur est survenue. Merci de réessayer.";
            setError(message);
            throw new Error("Error while creating invitation token");
          }

          if (establishment) {
            const sendInvitationBody = {
              invitedEmail: invitedEmail.toLowerCase().trim(),
              establishmentName: establishment.name,
              invitationToken: token,
              assignedChatbots,
            }

            const response: { success: boolean } = await emailService.sendInvitationEmail(sendInvitationBody);

            if(!response.success) {
              const message = "Une erreur est survenue. Merci de réessayer.";
              setError(message);
              throw new Error("Error while sending invitation email");
            }

            await fetchInvitationTokens();
            return response.success;
          }
          return null;
        } catch (err) {
          console.error("Unexpected error:", err);
          setError("Une erreur est survenue. Merci de réessayer.");
          return null;
        }
    },
    [establishment, fetchInvitationTokens, "session"]
  );

  const deleteInvitationToken = useCallback(
    async (tokenId: string): Promise<boolean> => {
        const { success } = await invitationTokenService.deleteInvitationToken(tokenId);

        if(!success) {
          const message = "Une erreur est survenue. Merci de réessayer.";
          setError(message);
          throw new Error("Error while deleting invitation token");
        }

        await fetchInvitationTokens();
        return success;
    },
    [fetchInvitationTokens]
  );

  const getStudentSessions = useCallback(
    async (sessionId: string): Promise<Student[]> => {
      try {
        const studentsSessions = await studentSessionService.getStudentSession(sessionId);
        const studentIds = studentsSessions.map((studentSession) => studentSession.id);
        const students = await studentService.getStudentsByIds(studentIds);

        return students;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const getSessionCourse = useCallback(
    async (sessionId: string): Promise<any> => {
      const courses = await courseService.getSessionCourses(sessionId);
      return courses || [];
    },
    ["session"]
  );

  const getCourseDetails = useCallback(
    async (courseId: string): Promise<CourseDetails | null> => {
      const { data } = await sessionService.getSessionDetails(courseId);

      return data || null;
    },
    ["session"]
  );

  const refreshData = useCallback(async () => {
    await fetchEtablissementData();
    if (establishment) {
      await fetchInvitationTokens();
    }
  }, [fetchEtablissementData, establishment, fetchInvitationTokens]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEtablissementData();
    }
  }, [authLoading, user, fetchEtablissementData]);

  useEffect(() => {
    if (establishment) {
      fetchInvitationTokens();
    }
  }, [establishment, fetchInvitationTokens]);

  return {
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
    getCourseDetails,
  };
}
