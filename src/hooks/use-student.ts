import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

import { useAuth } from "./use-auth";
import { Course, CourseRanking, InsertStudent, InsertStudentSession, Question, QuestionCourse, Session, Student, StudentCourseStats } from "@/types";

interface JoinedSession extends Session {
  joinedAt: string;
}

export function useStudent() {
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [joinedSessions, setJoinedSessions] = useState<JoinedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateEleve = useCallback(async () => {
    if (!user) {
      setStudent(null);
      setLoading(false);
      return;
    }

    try {
      const { data: existingEleve, error: fetchError } = await supabase
        .from("eleves")
        .select("*")
        .eq("supabase_user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching eleve:", fetchError);
        setError("Une erreur est survenue. Merci de réessayer.");
        setLoading(false);
        return;
      }

      if (existingEleve) {
        setStudent(existingEleve);
      } else {
        const name =
          user.metadata?.firstName && user.metadata?.lastName
            ? `${user.metadata.firstName} ${user.metadata.lastName}`
            : user.metadata?.firstName || "Élève";

        const studentData: InsertStudent = {
          supabaseUserId: user.id,
          name,
          email: user.email || "",
        };

        const { data: newEleve, error: insertError } = await supabase
          .from("eleves")
          .insert(studentData)
          .select()
          .single();

        if (insertError) {
          console.error("Error creating eleve:", insertError);
          setError("Une erreur est survenue. Merci de réessayer.");
          setLoading(false);
          return;
        }

        setStudent(newEleve);
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
      const { data: memberships, error: fetchError } = await supabase
        .from("eleve_sessions")
        .select(`
          joined_at,
          sessions (*)
        `)
        .eq("student_id", student.id)
        .order("joined_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching joined sessions:", fetchError);
        setError("Une erreur est survenue. Merci de réessayer.");
        return;
      }

      const sessions: JoinedSession[] = [];
      for (const m of memberships || []) {
        const sessionData = m.sessions as unknown as Session | null;
        if (sessionData) {
          sessions.push({
            ...sessionData,
            joinedAt: m.joined_at,
          });
        }
      }

      setJoinedSessions(sessions);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
    }
  }, [student]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrCreateEleve();
    }
  }, [authLoading, fetchOrCreateEleve]);

  useEffect(() => {
    if (student) {
      fetchJoinedSessions();
    }
  }, [student, fetchJoinedSessions]);

  const joinSessionByCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string; session?: Session }> => {
      if (!student) {
        return { success: false, error: "Vous devez être connecté pour rejoindre une session." };
      }

      const normalizedCode = code.toUpperCase().trim();

      try {
        const { data: session, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .eq("code", normalizedCode)
          .maybeSingle();

        if (sessionError) {
          console.error("Error finding session:", sessionError);
          return { success: false, error: "Erreur lors de la recherche de la session." };
        }

        if (!session) {
          return { success: false, error: "Aucune session trouvée avec ce code." };
        }

        const existingMembership = joinedSessions.find((s) => s.id === session.id);
        if (existingMembership) {
          return { success: false, error: "Vous avez déjà rejoint cette session." };
        }

        const membershipData: InsertStudentSession = {
          studentId: student.id,
          sessionId: session.id,
        };

        const { error: joinError } = await supabase
          .from("eleve_sessions")
          .insert(membershipData);

        if (joinError) {
          console.error("Error joining session:", joinError);
          if (joinError.code === "23505") {
            return { success: false, error: "Vous avez déjà rejoint cette session." };
          }
          return { success: false, error: "Erreur lors de l'inscription à la session." };
        }

        await fetchJoinedSessions();
        return { success: true, session };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur inattendue s'est produite." };
      }
    },
    [student, joinedSessions, fetchJoinedSessions]
  );

  const fetchCours = useCallback(
    async (sessionId: string): Promise<Course[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("cours")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (fetchError) {
          console.error("Error fetching cours:", fetchError);
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

        const fileName = `${user.id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          return { success: false, error: "Erreur lors du téléchargement de l'image." };
        }

        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        const { error: updateError } = await supabase
          .from("eleves")
          .update({ photo_url: photoUrl })
          .eq("id", student.id);

        if (updateError) {
          console.error("Error updating profile:", updateError);
          return { success: false, error: "Erreur lors de la mise à jour du profil." };
        }

        setStudent((prev) => prev ? { ...prev, photo_url: photoUrl } : null);

        return { success: true, url: photoUrl };
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
  const countAnsweredQuestionsForCours = useCallback(
    async (coursId: string): Promise<number> => {
      if (!student) return 0;
      
      try {
        const { count, error: fetchError } = await supabase
          .from("questions_cours")
          .select("*", { count: "exact", head: true })
          .eq("cours_id", coursId)
          .eq("student_id", student.id)
          .not("reponse", "is", null);

        if (fetchError) {
          console.error("Error counting answered questions:", fetchError);
          return 0;
        }

        return count || 0;
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
    fetchCours,
    fetchQuestions,
    leaveSession,
    refreshSessions: fetchJoinedSessions,
    uploadProfilePhoto,
    updateCoursProgress,
    fetchCoursClassement,
    getMyCoursStats,
    askQuestionCours,
    fetchQuestionsCoursForCours,
    countAnsweredQuestionsForCours,
  };
}
