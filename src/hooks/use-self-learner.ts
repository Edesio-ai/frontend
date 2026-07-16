import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/client";
import type { 
  SelfLearner, 
  SelfLearnerCourse, 
  InsertSelfLearnerCourse,
  Language,
  SelfLearnerCourseFile,
  SelfLearnerQuestion,
  GenerateQuestionsConfig,
  CreateManualQuestionRequest,
  QuestionType,
  UpdateQuestion
} from "@/types";
import { selfLearnerService } from "@/services/teaching/self-learner.service";
import { selfLearnerCourseService } from "@/services/teaching/self-learner-courses.service";
import { MAX_COURSES } from "@/utils/constants/self-learner";
import { selfLearnerCourseFileService } from "@/services/teaching/self-learner-course-file.service";
import { selfLearnerQuestionService } from "@/services/teaching/self-learner-question.service";
import { llmService } from "@/services/llm.service";


export function useSelfLearner() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations();
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
      setError(t.hooks.selfLearner.error);
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
      setError(t.hooks.selfLearner.error);
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
        setError(t.hooks.selfLearner.error);
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
        setError(t.hooks.selfLearner.error);
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
        setError(t.hooks.selfLearner.error);
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
        setError(t.hooks.selfLearner.uploadError);
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

  const deleteSelfLearnerCourseFile = useCallback(
    async (file: SelfLearnerCourseFile): Promise<boolean> => {
      try {
        await selfLearnerCourseFileService.deleteSelfLearnerCourseFile(file.id);

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.selfLearner.error);
        return false;
      }
    },
    []
  );

  const getPdfUrl = useCallback(
    async (courseId: string): Promise<string | null> => {
      try {
        const data = await selfLearnerCourseFileService.getSelfLearnerCourseFileSignedUrl(courseId);

        return data?.signedUrl || null;
      } catch (err) {
        console.error("Error getting PDF URL:", err);
        return null;
      }
    },
    []
  );

  const fetchSelfLearnerQuestions = useCallback(
    async (courseId: string): Promise<SelfLearnerQuestion[]> => {
      try {
        const data = await selfLearnerQuestionService.getSelfLearnerQuestions(courseId);

        return data;
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
      config: GenerateQuestionsConfig
    ): Promise<{ success: boolean; questionsCreated?: number; error?: string }> => {
      try {
        const result = await llmService.generateQuestions(coursId, config);

        return { success: true, questionsCreated: result.questionCount };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: t.hooks.selfLearner.generateError };
      }
    },
    []
  );

  const deleteSelfLearnerQuestion = useCallback(
    async (questionId: string): Promise<boolean> => {
      try {
        await selfLearnerQuestionService.deleteSelfLearnerQuestion(questionId);

        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.selfLearner.error);
        return false;
      }
    },
    []
  );

  const updateSelfLearnerQuestion = useCallback(
    async (questionId: string, updates: UpdateQuestion): Promise<boolean> => {
      try {
        await selfLearnerQuestionService.updateSelfLearnerQuestion(questionId, updates);
        
        setError(null);
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t.hooks.selfLearner.error);
        return false;
      }
    },
    []
  );

  const refreshCours = useCallback(async () => {
    await fetchSelfLearnerCourses();
  }, [fetchSelfLearnerCourses]);

  const generateSelfLearnerQuestion = useCallback(
    async (
      courseId: string,
      type: Omit<QuestionType, 'multiple'>
    ): Promise<{ success: boolean; question?: SelfLearnerQuestion; error?: string }> => {
      try {
        const question = await llmService.generateSelfLearnerQuestion(courseId, type);

        return { success: true, question: question };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: t.hooks.selfLearner.generateError };
      }
    },
    []
  );

  const createManualQuestion = useCallback(
    async (
      coursId: string,
      data: CreateManualQuestionRequest
    ): Promise<{ success: boolean; question?: SelfLearnerQuestion; error?: string }> => {
      try {
        const question = await selfLearnerQuestionService.createSelfLearnerQuestion(coursId, data);

        return { success: true, question: question };
      } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: t.hooks.selfLearner.error };
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
    deleteSelfLearnerCourseFile,
    getPdfUrl,
    fetchSelfLearnerQuestions,
    generateQuestions,
    generateSelfLearnerQuestion,
    createManualQuestion,
    deleteSelfLearnerQuestion,
    updateSelfLearnerQuestion,
    refreshCours,
  };
}
