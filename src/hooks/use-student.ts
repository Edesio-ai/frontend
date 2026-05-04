import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

import { useAuth } from "./use-auth";
import { Course, CourseRanking, InsertStudentSession, JoinedSession, Question, QuestionCourse, Session, Student, StudentCourseStats } from "@/types";
import { studentService } from "@/services/student.service";
import { sessionService } from "@/services/session.service";
import { questionService } from "@/services/question.service";


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
      const sessions = await studentService.getJoinedSessions(student.id);

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
    async (code: string): Promise<{ success: boolean; error?: string}> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté pour rejoindre une session." };
      }

      const normalizedCode = code.toUpperCase().trim();

      try {
        await studentService.joinSessionByCode(normalizedCode);

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
        const courses = await sessionService.getSessionCourses(sessionId);

        return courses || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const fetchQuestions = useCallback(
    async (coursId: string): Promise<Question[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("questions")
          .select("*")
          .eq("cours_id", coursId)
          .order("created_at", { ascending: true });

        if (fetchError) {
          console.error("Error fetching questions:", fetchError);
          return [];
        }

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
        const { error: deleteError } = await supabase
          .from("eleve_sessions")
          .delete()
          .eq("student_id", student.id)
          .eq("session_id", sessionId);

        if (deleteError) {
          console.error("Error leaving session:", deleteError);
          return false;
        }

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

  const updateCoursProgress = useCallback(
    async (
      coursId: string,
      questionsTentees: number,
      reponsesCorrectes: number
    ): Promise<{ success: boolean; error?: string }> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté." };
      }

      try {
        const { data: existingStat, error: fetchError } = await supabase
          .from("eleve_cours_stats")
          .select("*")
          .eq("student_id", student.id)
          .eq("cours_id", coursId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching existing stat:", fetchError);
          return { success: false, error: "Erreur lors de la récupération des statistiques." };
        }

        if (existingStat) {
          const { error: updateError } = await supabase
            .from("eleve_cours_stats")
            .update({
              questions_tentees: existingStat.questions_tentees + questionsTentees,
              reponses_correctes: existingStat.reponses_correctes + reponsesCorrectes,
              derniere_tentative: new Date().toISOString(),
            })
            .eq("id", existingStat.id);

          if (updateError) {
            console.error("Error updating stat:", updateError);
            return { success: false, error: "Erreur lors de la mise à jour des statistiques." };
          }
        } else {
          const { error: insertError } = await supabase
            .from("eleve_cours_stats")
            .insert({
              student_id: student.id,
              cours_id: coursId,
              questions_tentees: questionsTentees,
              reponses_correctes: reponsesCorrectes,
            });

          if (insertError) {
            console.error("Error inserting stat:", insertError);
            return { success: false, error: "Erreur lors de l'enregistrement des statistiques." };
          }
        }

        return { success: true };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student]
  );

  const fetchCoursClassement = useCallback(
    async (coursId: string): Promise<CourseRanking[]> => {
      if (!student) return [];

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error("No access token available");
          return [];
        }

        const response = await fetch(`/api/cours/${coursId}/classement`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error("Error fetching course classement:", response.statusText);
          return [];
        }

        const rankings: CourseRanking[] = await response.json();
        return rankings;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    [student]
  );

  const getMyCoursStats = useCallback(
    async (coursId: string): Promise<StudentCourseStats | null> => {
      if (!student) return null;

      try {
        const { data, error } = await supabase
          .from("eleve_cours_stats")
          .select("*")
          .eq("student_id", student.id)
          .eq("cours_id", coursId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching my stats:", error);
          return null;
        }

        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        return null;
      }
    },
    [student]
  );

  const askQuestionCours = useCallback(
    async (coursId: string, questionText: string): Promise<{ success: boolean; error?: string; question?: QuestionCourse }> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté." };
      }

      if (!questionText.trim()) {
        return { success: false, error: "La question ne peut pas être vide." };
      }

      try {
        const { data, error: insertError } = await supabase
          .from("questions_cours")
          .insert({
            cours_id: coursId,
            student_id: student.id,
            question: questionText.trim(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting question:", insertError);
          return { success: false, error: "Erreur lors de l'envoi de la question." };
        }

        return { success: true, question: data };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student]
  );

  const fetchQuestionsCoursForCours = useCallback(
    async (coursId: string): Promise<QuestionCourse[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("questions_cours")
          .select("*")
          .eq("cours_id", coursId)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching questions cours:", fetchError);
          return [];
        }

        return data || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  // Count answered questions for the current student per course
  const countAnsweredQuestionsForCourse = useCallback(
    async (): Promise<number> => {
      if (!student) return 0;
      
      try {
        const data = await questionService.getAnsweredQuestionsCourse()

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
    updateCoursProgress,
    fetchCoursClassement,
    getMyCoursStats,
    askQuestionCours,
    fetchQuestionsCoursForCours,
    countAnsweredQuestionsForCourse,
  };
}
