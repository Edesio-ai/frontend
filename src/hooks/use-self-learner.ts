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


export function useSelfLearner() {
  const { user, loading: authLoading } = useAuth();
  const [selfLearner, setSelfLearner] = useState<SelfLearner | null>(null);
  const [cours, setCours] = useState<SelfLearnerCourse[]>([]);
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
      setCours([]);
      return;
    }

    try {
      const data = await selfLearnerCourseService.getSelfLearnerCourses();

      setCours(data || []);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
    }
  }, [selfLearner]);

  const createCours = useCallback(
    async (
      title: string,
      description: string,
      contentText: string,
      language: Language = 'francais',
      pdfFiles?: File[]
    ): Promise<SelfLearnerCourse | null> => {
      if (!selfLearner) return null;

      try {
        const { count, error: countError } = await supabase
          .from("autodidacte_cours")
          .select("*", { count: "exact", head: true })
          .eq("self_learner_id", selfLearner.id);

        if (countError) {
          console.error("Error counting cours:", countError);
          setError("Erreur lors de la vérification du nombre de cours.");
          return null;
        }

        const MAX_COURS = 50;
        if (count !== null && count >= MAX_COURS) {
          setError(`Vous avez atteint la limite de ${MAX_COURS} cours.`);
          return null;
        }

        const coursData: InsertSelfLearnerCourse = {
          selfLearnerId: selfLearner.id,
          title,
          description: description || null,
          contentText: contentText || null,
          language,
        };

        const { data, error: insertError } = await supabase
          .from("autodidacte_cours")
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

        setCours((prev) => [data, ...prev]);
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

  const updateCours = useCallback(
    async (
      coursId: string,
      titre: string,
      description: string | null,
      contenuTexte: string | null
    ): Promise<SelfLearnerCourse | null> => {
      try {
        const { data, error: updateError } = await supabase
          .from("autodidacte_cours")
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

        setCours((prev) =>
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

  const deleteCours = useCallback(
    async (coursId: string): Promise<boolean> => {
      try {
        const { data: fichiers } = await supabase
          .from("autodidacte_cours_fichiers")
          .select("fichier_url")
          .eq("cours_id", coursId);

        if (fichiers && fichiers.length > 0) {
          const filePaths = fichiers.map((f) => f.fichier_url);
          await supabase.storage.from("cours-pdf").remove(filePaths);
        }

        await supabase
          .from("autodidacte_cours_fichiers")
          .delete()
          .eq("cours_id", coursId);

        await supabase
          .from("autodidacte_questions")
          .delete()
          .eq("cours_id", coursId);

        const { error: deleteError } = await supabase
          .from("autodidacte_cours")
          .delete()
          .eq("id", coursId);

        if (deleteError) {
          console.error("Error deleting cours:", deleteError);
          setError("Erreur lors de la suppression du cours.");
          return false;
        }

        setCours((prev) => prev.filter((c) => c.id !== coursId));
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

  const uploadPdfForCours = useCallback(
    async (coursId: string, file: File): Promise<SelfLearnerCourseFile | null> => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `autodidacte/${coursId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("cours-pdf")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading PDF:", uploadError);
          setError(`Erreur upload: ${uploadError.message || "Erreur inconnue"}`);
          return null;
        }

        const { data: fichierData, error: insertError } = await supabase
          .from("autodidacte_cours_fichiers")
          .insert({
            courseId: coursId,
            fileUrl: fileName,
            fileName: file.name,
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
    async (coursId: string): Promise<SelfLearnerCourseFile[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .from("autodidacte_cours_fichiers")
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
    createCours,
    updateCours,
    deleteCours,
    uploadPdfForCours,
    fetchCoursFichiers,
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
