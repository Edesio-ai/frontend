import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

import type {
  Teacher,
  Session,
  SessionLanguage,
  Course,
  CourseFile,
  Question,
  CourseQuestion,
  InsertSession,
  InsertCourse,
  SessionParticipant,
  CoursRanking
} from "@/types";
import { teacherService } from "@/services/teacher.service";
import { generateUniqueSessionCode } from "@/utils/functions/session.utils";
import { sessionService } from "@/services/session.service";

interface TeacherWithEtab extends Teacher {
  establishment_id?: string | null;
}


export function useTeacher() {
  const { user, loading: authLoading } = useAuth();
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
      setError("Une erreur est survenue. Merci de réessayer.");
      setLoading(false);
      throw error;
    }


  }, [user]);

  const handleInvitationValidation = useCallback(async (invitationToken: string): Promise<any> => {
    try {
      const response = await teacherService.validateInvitationToken(invitationToken);
      return response;
    } catch (err) {
      console.error("Error validating invitation token:", err);
    }
    
  }, [user]);

  const handleCreateTeacher = useCallback(async (name: string, email: string) => {
    try {
      const response = await teacherService.createTeacher(name, email);
      return response;
    } catch (err) {
      console.error("Error creating teacher:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
      setLoading(false);
      return;
    }
  }, [user]);
  const fetchOrCreateProfesseur = useCallback(async () => {
    if (!user) {
      setTeacher(null);
      setLoading(false);
      return;
    }

    const  teacher  = await handleFetchTeacher();

    if (teacher) {
      setTeacher(teacher);
      const invitationToken = user.user_metadata?.invitationToken;
      const teacherWithEstab = teacher as TeacherWithEtab;
      if (invitationToken && !teacherWithEstab.establishment_id) {
        await handleInvitationValidation(invitationToken);
      }
    } else {
      const name =
        user.user_metadata?.firstname && user.user_metadata?.lastname
          ? `${user.user_metadata.firstname} ${user.user_metadata.lastname}`
          : user.user_metadata?.firstname || "Professeur";

      const invitationToken = user.user_metadata?.invitationToken;

      const newTeacher = await handleCreateTeacher(name, user.email || "");

      if (invitationToken && newTeacher) {
        await handleInvitationValidation(invitationToken);
        setTeacher(newTeacher);
      }
    }
    setLoading(false);
  }, [user]);

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
      setError("Une erreur est survenue. Merci de réessayer.");
    }
  }, [teacher]);

  const handleCreateSession = async (sessionData: InsertSession): Promise<Session> => {
    try {
      return await sessionService.insertSession(sessionData);
    
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
      throw err;
    }
  }


  const createSession = useCallback(
    async (name: string, language: SessionLanguage = 'francais'): Promise<Session | null> => {
      if (!teacher) return null;

      try {
      const code = await generateUniqueSessionCode();

        const sessionData: InsertSession = {
          teacherId: teacher.id,
          name,
          code,
          language,
        };
        const session : Session = await handleCreateSession(sessionData);

        setSessions((prev) => [session, ...prev]);
        setError(null);
        return session;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    [teacher]
  );

  const updateSession = useCallback(
    async (sessionId: string, nom: string): Promise<Session | null> => {
      if (!teacher) return null;

      try {
        const { data, error: updateError } = await supabase
          .from("sessions")
          .update({ nom })
          .eq("id", sessionId)
          .eq("teacher_id", teacher.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating session:", updateError);
          setError("Erreur lors de la mise à jour de la session.");
          return null;
        }

        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? data : s))
        );
        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    [teacher]
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!teacher) return false;

      try {
        // First delete all questions for courses in this session
        const { data: courses, error: coursesError } = await supabase
          .from("cours")
          .select("id")
          .eq("session_id", sessionId);

        if (coursesError) {
          console.error("Error fetching courses for deletion:", coursesError);
          setError("Erreur lors de la récupération des cours.");
          return false;
        }

        if (courses && courses.length > 0) {
          const courseIds = courses.map((c) => c.id);
          // Delete questions for all courses
          const { error: questionsError } = await supabase
            .from("questions")
            .delete()
            .in("cours_id", courseIds);

          if (questionsError) {
            console.error("Error deleting questions:", questionsError);
            setError("Erreur lors de la suppression des questions.");
            return false;
          }

          // Delete course files from storage and database
          for (const course of courses) {
            const { data: fichiers, error: fichiersError } = await supabase
              .from("cours_fichiers")
              .select("fichier_url")
              .eq("cours_id", course.id);

            if (fichiersError) {
              console.error("Error fetching course files:", fichiersError);
              setError("Erreur lors de la récupération des fichiers.");
              return false;
            }

            if (fichiers && fichiers.length > 0) {
              const filePaths = fichiers.map((f) => f.fichier_url);
              const { error: storageError } = await supabase.storage.from("cours-pdf").remove(filePaths);

              if (storageError) {
                console.error("Error removing files from storage:", storageError);
                // Continue anyway as files might not exist
              }
            }

            const { error: deleteFichiersError } = await supabase
              .from("cours_fichiers")
              .delete()
              .eq("cours_id", course.id);

            if (deleteFichiersError) {
              console.error("Error deleting file records:", deleteFichiersError);
              setError("Erreur lors de la suppression des enregistrements de fichiers.");
              return false;
            }
          }

          // Delete all courses
          const { error: deleteCoursError } = await supabase
            .from("cours")
            .delete()
            .eq("session_id", sessionId);

          if (deleteCoursError) {
            console.error("Error deleting courses:", deleteCoursError);
            setError("Erreur lors de la suppression des cours.");
            return false;
          }
        }

        // Delete student enrollments for this session
        const { error: enrollmentsError } = await supabase
          .from("eleve_sessions")
          .delete()
          .eq("session_id", sessionId);

        if (enrollmentsError) {
          console.error("Error deleting enrollments:", enrollmentsError);
          setError("Erreur lors de la suppression des inscriptions élèves.");
          return false;
        }

        // Finally delete the session
        const { error: deleteError } = await supabase
          .from("sessions")
          .delete()
          .eq("id", sessionId)
          .eq("professeur_id", teacher.id);

        if (deleteError) {
          console.error("Error deleting session:", deleteError);
          setError("Erreur lors de la suppression de la session.");
          return false;
        }

        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    [teacher]
  );

  const fetchCours = useCallback(
    async (sessionId: string): Promise<Course[]> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error("No access token available");
          setError("Vous devez être connecté");
          return [];
        }

        const response = await fetch(`/api/sessions/${sessionId}/cours`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching cours:", errorData.error);
          setError("Une erreur est survenue. Merci de réessayer.");
          return [];
        }

        const data = await response.json();
        setError(null);
        return data || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return [];
      }
    },
    []
  );

  const updateCours = useCallback(
    async (
      coursId: string,
      titre: string,
      description: string | null,
      contenuTexte: string | null
    ): Promise<Course | null> => {
      try {
        const { data, error: updateError } = await supabase
          .from("cours")
          .update({
            titre,
            description: description || null,
            contenu_texte: contenuTexte || null,
          })
          .eq("id", coursId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating cours:", updateError);
          setError("Erreur lors de la mise à jour du cours.");
          return null;
        }

        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    []
  );

  const createCourse = useCallback(
    async (
      sessionId: string,
      titre: string,
      description: string,
      contenuTexte: string,
      pdfFiles?: File[]
    ): Promise<Course | null> => {
      try {
        const { count, error: countError } = await supabase
          .from("cours")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);

        if (countError) {
          console.error("Error counting cours:", countError);
          setError("Erreur lors de la vérification du nombre de cours.");
          return null;
        }

        const MAX_COURS_PER_SESSION = 50;
        if (count !== null && count >= MAX_COURS_PER_SESSION) {
          setError(`Vous avez atteint la limite de ${MAX_COURS_PER_SESSION} cours par session.`);
          return null;
        }

        const coursData: InsertCourse = {
          session_id: sessionId,
          titre,
          description: description || null,
          contenu_texte: contenuTexte || null,
        };

        const { data, error: insertError } = await supabase
          .from("cours")
          .insert(coursData)
          .select()
          .single();

        if (insertError) {
          console.error("Error creating cours:", insertError);
          setError("Une erreur est survenue. Merci de réessayer.");
          return null;
        }

        if (pdfFiles && pdfFiles.length > 0 && data) {
          for (const pdfFile of pdfFiles) {
            await uploadPdfForCours(data.id, pdfFile);
          }
        }

        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    []
  );

  const uploadPdfForCours = useCallback(
    async (coursId: string, file: File): Promise<CourseFile | null> => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${coursId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("cours-pdf")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading PDF:", uploadError);
          console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
          if (uploadError.message?.includes("not found")) {
            setError("Le bucket 'cours-pdf' n'existe pas dans Supabase Storage.");
          } else if (uploadError.message?.includes("Unauthorized") || uploadError.message?.includes("security")) {
            setError("Permission refusée. Vérifiez les politiques du bucket 'cours-pdf'.");
          } else {
            setError(`Erreur upload: ${uploadError.message || "Erreur inconnue"}`);
          }
          return null;
        }

        const { data: fichierData, error: insertError } = await supabase
          .from("cours_fichiers")
          .insert({
            cours_id: coursId,
            fichier_url: fileName,
            nom_fichier: file.name,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting file record:", insertError);
          setError("Erreur lors de l'enregistrement du fichier.");
          return null;
        }

        setError(null);
        return fichierData;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue lors de l'upload.");
        return null;
      }
    },
    []
  );

  const fetchCoursFichiers = useCallback(
    async (coursId: string): Promise<CourseFile[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("cours_fichiers")
          .select("*")
          .eq("cours_id", coursId)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching fichiers:", fetchError);
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

  const deleteCoursFichier = useCallback(
    async (fichier: CourseFile): Promise<boolean> => {
      try {
        const { error: storageError } = await supabase.storage
          .from("cours-pdf")
          .remove([fichier.fichier_url]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          setError("Erreur lors de la suppression du fichier.");
          return false;
        }

        const { error: deleteError } = await supabase
          .from("cours_fichiers")
          .delete()
          .eq("id", fichier.id);

        if (deleteError) {
          console.error("Error deleting file record:", deleteError);
          setError("Erreur lors de la suppression de l'enregistrement.");
          return false;
        }

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue lors de la suppression.");
        return false;
      }
    },
    []
  );

  const getPdfUrl = useCallback(
    async (filePath: string): Promise<string | null> => {
      try {
        const { data } = await supabase.storage
          .from("cours-pdf")
          .createSignedUrl(filePath, 3600);

        return data?.signedUrl || null;
      } catch (err) {
        console.error("Error getting PDF URL:", err);
        return null;
      }
    },
    []
  );

  const fetchQuestions = useCallback(
    async (coursId: string): Promise<Question[]> => {
      try {
        console.log("fetchQuestions called for coursId:", coursId);
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error("No access token available");
          return [];
        }

        console.log("Fetching questions from API...");
        const response = await fetch(`/api/cours/${coursId}/questions`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching questions:", errorData.error);
          return [];
        }

        const data = await response.json();
        console.log("Questions fetched:", data?.length || 0, "questions");
        return data || [];
      } catch (err) {
        console.error("Unexpected error in fetchQuestions:", err);
        return [];
      }
    },
    []
  );

  const updateQuestion = useCallback(
    async (
      questionId: string,
      updates: {
        type?: "single" | "multiple" | "open";
        question?: string;
        propositions?: string[] | null;
        good_answer?: string | null;
        good_answers?: string[] | null;
        explanation?: string | null;
      }
    ): Promise<Question | null> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          setError("Vous devez être connecté");
          return null;
        }

        const response = await fetch(`/api/questions/${questionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Erreur lors de la mise à jour");
          return null;
        }

        setError(null);
        return result.question;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    []
  );

  const deleteQuestion = useCallback(
    async (questionId: string): Promise<boolean> => {
      try {
        console.log("deleteQuestion called with id:", questionId);
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.log("No access token");
          setError("Vous devez être connecté");
          return false;
        }

        console.log("Sending DELETE request to /api/questions/" + questionId);
        const response = await fetch(`/api/questions/${questionId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const result = await response.json();
          console.log("Delete failed:", result);
          setError(result.error || "Erreur lors de la suppression");
          return false;
        }

        console.log("Delete successful");
        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    []
  );

  const createQuestion = useCallback(
    async (
      coursId: string,
      questionData: {
        type: "single" | "multiple" | "open";
        question: string;
        propositions?: string[];
        bonne_reponse?: string;
        bonnes_reponses?: string[];
        explication?: string;
      }
    ): Promise<Question | null> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          setError("Vous devez être connecté");
          return null;
        }

        const response = await fetch("/api/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            coursId,
            ...questionData,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Erreur lors de la création");
          return null;
        }

        setError(null);
        return result.question;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    []
  );

  interface GenerateQuestionsConfig {
    totalQuestions?: number;
    qcmCount?: number;
    ouverteCount?: number;
  }

  const generateQuestions = useCallback(
    async (
      coursId: string,
      config?: GenerateQuestionsConfig
    ): Promise<{ success: boolean; questionsCreated?: number; questions?: Question[]; error?: string }> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          return { success: false, error: "Vous devez être connecté pour générer des questions" };
        }

        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            coursId,
            ...config
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || "Erreur lors de la génération" };
        }

        return { success: true, questionsCreated: data.questionsCreated, questions: data.questions || [] };
      } catch (err) {
        console.error("Error generating questions:", err);
        return { success: false, error: "Erreur de connexion au serveur" };
      }
    },
    []
  );

  const validateQuestions = useCallback(
    async (coursId: string): Promise<{ success: boolean; cours?: Course; error?: string }> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          return { success: false, error: "Vous devez être connecté" };
        }

        const response = await fetch(`/api/cours/${coursId}/validate-questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || "Erreur lors de la validation" };
        }

        return { success: true, cours: data.cours };
      } catch (err) {
        console.error("Error validating questions:", err);
        return { success: false, error: "Erreur de connexion au serveur" };
      }
    },
    []
  );

  const fetchSessionParticipants = useCallback(
    async (sessionId: string): Promise<SessionParticipant[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("eleve_sessions")
          .select(`
            joined_at,
            eleves (
              id,
              nom,
              email,
              photo_url
            )
          `)
          .eq("session_id", sessionId)
          .order("joined_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching session participants:", fetchError);
          return [];
        }

        const participants: SessionParticipant[] = [];
        for (const row of data || []) {
          const eleveData = row.eleves as unknown as { id: string; nom: string; email: string; photo_url: string | null } | null;
          if (eleveData) {
            participants.push({
              studentId: eleveData.id,
              name: eleveData.nom,
              email: eleveData.email,
              photoUrl: eleveData.photo_url,
              joinedAt: row.joined_at,
            });
          }
        }

        return participants;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const fetchCoursClassement = useCallback(
    async (coursId: string): Promise<CoursRanking[]> => {
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

        const rankings: CoursRanking[] = await response.json();
        return rankings;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const fetchQuestionsCoursForCours = useCallback(
    async (coursId: string): Promise<CourseQuestion[]> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error("No access token available");
          return [];
        }

        const response = await fetch(`/api/cours/${coursId}/questions-cours`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching questions cours:", errorData.error);
          return [];
        }

        const data = await response.json();
        return data || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const fetchPendingQuestionsCount = useCallback(
    async (sessionId: string): Promise<number> => {
      try {
        const { data: courses, error: coursesError } = await supabase
          .from("cours")
          .select("id")
          .eq("session_id", sessionId);

        if (coursesError || !courses || courses.length === 0) {
          return 0;
        }

        const courseIds = courses.map(c => c.id);

        const { count, error: countError } = await supabase
          .from("questions_cours")
          .select("*", { count: "exact", head: true })
          .in("cours_id", courseIds)
          .is("reponse", null);

        if (countError) {
          console.error("Error counting pending questions:", countError);
          return 0;
        }

        return count || 0;
      } catch (err) {
        console.error("Unexpected error:", err);
        return 0;
      }
    },
    []
  );

  const answerQuestionCours = useCallback(
    async (questionId: string, reponse: string): Promise<CourseQuestion | null> => {
      try {
        const { data, error: updateError } = await supabase
          .from("questions_cours")
          .update({
            reponse,
            repondu_at: new Date().toISOString(),
          })
          .eq("id", questionId)
          .select()
          .single();

        if (updateError) {
          console.error("Error answering question:", updateError);
          setError("Erreur lors de la réponse à la question.");
          return null;
        }

        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue.");
        return null;
      }
    },
    []
  );

  const deleteQuestionCours = useCallback(
    async (questionId: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from("questions_cours")
          .delete()
          .eq("id", questionId);

        if (deleteError) {
          console.error("Error deleting question:", deleteError);
          setError("Erreur lors de la suppression de la question.");
          return false;
        }

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue.");
        return false;
      }
    },
    []
  );

  useEffect(() => {
    if (!authLoading) {
      fetchOrCreateProfesseur();
    }
  }, [authLoading, fetchOrCreateProfesseur]);

  useEffect(() => {
    if (teacher) {
      fetchSessions();
    }
  }, [teacher, fetchSessions]);

  const reorderCours = useCallback(
    async (coursIds: string[]): Promise<boolean> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          setError("Vous devez être connecté");
          return false;
        }

        const response = await fetch("/api/cours/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ coursIds }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Erreur lors de la mise à jour de l'ordre des cours.");
          return false;
        }

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    []
  );

  const deleteCours = useCallback(
    async (coursId: string): Promise<boolean> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          setError("Vous devez être connecté");
          return false;
        }

        const response = await fetch(`/api/cours/${coursId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Erreur lors de la suppression");
          return false;
        }

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    []
  );

  const reorderQuestions = useCallback(
    async (questionIds: string[]): Promise<boolean> => {
      try {
        const updates = questionIds.map((id, index) => ({
          id,
          position_ordre: index,
        }));

        for (const update of updates) {
          const { error: updateError } = await supabase
            .from("questions")
            .update({ position_ordre: update.position_ordre })
            .eq("id", update.id);

          if (updateError) {
            console.error("Error updating question order:", updateError);
            setError("Erreur lors de la mise à jour de l'ordre des questions.");
            return false;
          }
        }

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    []
  );

  return {
    teacher,
    sessions,
    loading: authLoading || loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    fetchCours,
    createCourse,
    updateCours,
    deleteCours,
    reorderCours,
    uploadPdfForCours,
    fetchCoursFichiers,
    deleteCoursFichier,
    getPdfUrl,
    fetchQuestions,
    updateQuestion,
    deleteQuestion,
    createQuestion,
    reorderQuestions,
    generateQuestions,
    validateQuestions,
    refreshSessions: fetchSessions,
    fetchSessionParticipants,
    fetchCoursClassement,
    fetchQuestionsCoursForCours,
    fetchPendingQuestionsCount,
    answerQuestionCours,
    deleteQuestionCours,
  };
}
