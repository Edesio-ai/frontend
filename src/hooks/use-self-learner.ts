import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import type { 
  SelfLearner, 
  SelfLearnerCourse, 
  InsertSelfLearnerCourse,
  Language,
  SelfLearnerCourseFile,
  SelfLearnerQuestion
} from "@/types";
import { selfLearnerService } from "@/services/teaching/self-learner.service";
import { selfLearnerCourseService } from "@/services/teaching/self-learner-courses.service";
import { MAX_COURSES } from "@/utils/constants/self-learner";
import { selfLearnerCourseFileService } from "@/services/teaching/self-learner-course-file.service";


export function useSelfLearner() {
  const { user, loading: authLoading } = useAuth();
  const [selfLearner, setSelfLearner] = useState<SelfLearner | null>(null);
  const [cours, setCourse] = useState<SelfLearnerCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateSelfLearner = useCallback(async () => {
    if (!user) {
      setSelfLearner(null);
      setLoading(false);
      return;
    }

    try {
      const existingSelfLearner = await selfLearnerService.getSelfLearner();

      if (existingSelfLearner) {
        setSelfLearner(existingSelfLearner);
      } else {
        const newSelfLearner = await selfLearnerService.createSelfLearner();

        setSelfLearner(newSelfLearner);
      }

      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSelfLearnerCourses = useCallback(async () => {
    if (!selfLearner) {
      setCourse([]);
      return;
    }

    try {
      const data = await selfLearnerCourseService.getSelfLearnerCourses();

      setCourse(data || []);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
    }
  }, [selfLearner]);

  const createSelfLearnerCourse = useCallback(
    async (
      title: string,
      description: string,
      contentText: string,
      language: Language = 'francais',
      pdfFiles?: File[]
    ): Promise<SelfLearnerCourse | null> => {
      if (!selfLearner) return null;

      try {

        const { count } = await selfLearnerCourseService.getSelfLearnerCoursesCount();

        if (count !== null && count >= MAX_COURSES) {
          setError(`Vous avez atteint la limite de ${MAX_COURSES} cours.`);
          return null;
        }

        const coursData: InsertSelfLearnerCourse = {
          title,
          description,
          contentText,
          language,
        };

        const data = await selfLearnerCourseService.createSelfLearnerCourse(coursData);

        if (pdfFiles && pdfFiles.length > 0 && data) {
          for (const pdfFile of pdfFiles) {
            await uploadCoursePdf(data.id, pdfFile);
          }
        }

        setCourse((prev) => [data, ...prev]);
        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    [selfLearner]
  );

  const updateSelfLearnerCourse = useCallback(
    async (
      coursId: string,
      titre: string,
      description: string | null,
      contenuTexte: string | null
    ): Promise<SelfLearnerCourse | null> => {
      try {
        const body = {
          title: titre,
          description: description || null,
          contentText: contenuTexte || null,
        };

        const data = await selfLearnerCourseService.updateSelfLearnerCourse(coursId, body);
        setCourse((prev) =>
          prev.map((c) => (c.id === coursId ? data : c))
        );
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

  const deleteSelfLearnerCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        await selfLearnerCourseService.deleteSelfLearnerCourse(courseId);

        setCourse((prev) => prev.filter((c) => c.id !== courseId));
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

  const uploadCoursePdf = useCallback(
    async (courseId: string, file: File): Promise<SelfLearnerCourseFile | null> => {
      try {
        const { data } = await selfLearnerCourseFileService.uploadPdfForCourse(courseId, file);
        
        setError(null);
        return data;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue lors de l'upload.");
        return null;
      }
    },
    []
  );

  const fetchSelfLearnerCourseFiles = useCallback(
    async (courseId: string): Promise<SelfLearnerCourseFile[]> => {
      try {
        const data = await selfLearnerCourseFileService.getSelfLearnerCourseFiles(courseId);

        return data || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const deleteCoursFichier = useCallback(
    async (fichier: SelfLearnerCourseFile): Promise<boolean> => {
      try {
        await supabase.storage.from("cours-pdf").remove([fichier.fileUrl]);

        const { error: deleteError } = await supabase
          .from("autodidacte_cours_fichiers")
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
    async (coursId: string): Promise<SelfLearnerQuestion[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("autodidacte_questions")
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

  const generateQuestions = useCallback(
    async (
      coursId: string,
      config?: { qcm?: number; multi?: number; ouverte?: number }
    ): Promise<{ success: boolean; questionsCreated?: number; error?: string }> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          return { success: false, error: "Vous devez être connecté" };
        }

        const response = await fetch("/api/autonome/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ coursId, config }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Erreur lors de la génération" };
        }

        return { success: true, questionsCreated: result.questionsCreated };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur est survenue. Merci de réessayer." };
      }
    },
    []
  );

  const deleteQuestion = useCallback(
    async (questionId: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from("autodidacte_questions")
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
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    []
  );

  const updateQuestion = useCallback(
    async (questionId: string, updates: { question?: string; bonne_reponse?: string }): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from("autodidacte_questions")
          .update(updates)
          .eq("id", questionId);

        if (updateError) {
          console.error("Error updating question:", updateError);
          setError("Erreur lors de la mise à jour de la question.");
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

  const refreshCours = useCallback(async () => {
    await fetchSelfLearnerCourses();
  }, [fetchSelfLearnerCourses]);

  const addOneQuestion = useCallback(
    async (
      coursId: string,
      type: 'qcm' | 'ouverte'
    ): Promise<{ success: boolean; question?: SelfLearnerQuestion; error?: string }> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          return { success: false, error: "Vous devez être connecté" };
        }

        const response = await fetch("/api/autonome/add-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ coursId, type }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Erreur lors de la génération" };
        }

        return { success: true, question: result.question };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur est survenue. Merci de réessayer." };
      }
    },
    []
  );

  const createManualQuestion = useCallback(
    async (
      coursId: string,
      data: {
        type: 'qcm' | 'ouverte';
        question: string;
        propositions?: string[];
        bonne_reponse: string;
        explication?: string;
      }
    ): Promise<{ success: boolean; question?: SelfLearnerQuestion; error?: string }> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          return { success: false, error: "Vous devez être connecté" };
        }

        const response = await fetch("/api/autonome/create-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ coursId, ...data }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Erreur lors de la création" };
        }

        return { success: true, question: result.question };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: "Une erreur est survenue. Merci de réessayer." };
      }
    },
    []
  );

  useEffect(() => {
    if (!authLoading) {
      fetchOrCreateSelfLearner();
    }
  }, [authLoading, fetchOrCreateSelfLearner]);

  useEffect(() => {
    if (selfLearner) {
      fetchSelfLearnerCourses();
    }
  }, [selfLearner, fetchSelfLearnerCourses]);

  return {
    selfLearner,
    cours,
    loading,
    error,
    createSelfLearnerCourse,
    updateSelfLearnerCourse,
    deleteSelfLearnerCourse,
    uploadCoursePdf,
    fetchSelfLearnerCourseFiles,
    deleteCoursFichier,
    getPdfUrl,
    fetchQuestions,
    generateQuestions,
    addOneQuestion,
    createManualQuestion,
    deleteQuestion,
    updateQuestion,
    refreshCours,
  };
}
