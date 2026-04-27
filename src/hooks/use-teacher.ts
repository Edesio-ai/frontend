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
  CourseRanking,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  UpdateCourseRequest
} from "@/types";
import { teacherService } from "@/services/teacher.service";
import { generateUniqueSessionCode } from "@/utils/functions/session.utils";
import { sessionService } from "@/services/session.service";
import { courseService } from "@/services/course.service";
import { questionService } from "@/services/question.service";
import { GenerateQuestionsConfig } from "@/types/question.type";
type CoursesTableRow = {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  text_content: string | null;
  validated_questions: boolean | null;
  position_order: number | null;
  created_at: string;
};

function courseFromCoursesRow(row: CoursesTableRow): Course {
  return {
    id: row.id,
    sessionId: row.session_id,
    title: row.title,
    description: row.description,
    contentText: row.text_content,
    validatedQuestions: Boolean(row.validated_questions),
    positionOrder: row.position_order ?? undefined,
    createdAt: row.created_at,
  };
}

type CourseQuestionsTableRow = {
  id: string;
  course_id: string;
  student_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  student_name?: string | null;
};

function courseQuestionFromRow(row: CourseQuestionsTableRow): CourseQuestion {
  return {
    id: row.id,
    courseId: row.course_id,
    studentId: row.student_id,
    question: row.question,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
    studentName: row.student_name ?? undefined,
  };
}

interface TeacherWithEtab extends Teacher {
  establishmentId?: string | null;
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

    const teacher = await handleFetchTeacher();

    if (teacher) {
      setTeacher(teacher);
      const invitationToken = user.metadata?.invitationToken;
      const teacherWithEstab = teacher as TeacherWithEtab;
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
        const session: Session = await handleCreateSession(sessionData);

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

  const handleUpdateSessionName = async (sessionId: string, name: string): Promise<Session> => {
    try {
      if (!teacher) {
        throw new Error("Teacher not found");
      }
      const { session } = await sessionService.updateSessionName(sessionId, name, teacher.id);
      return session;

    } catch (err) {
      console.error("Error updating session:", err);
      setError("Erreur lors de la mise à jour de la session.");
      throw err;

    }
  }

  const updateSession = useCallback(
    async (sessionId: string, nom: string): Promise<Session | null> => {
      if (!teacher) return null;

      try {
        const data = await handleUpdateSessionName(sessionId, nom);

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

  const handleDeleteSession = async (sessionId: string): Promise<unknown> => {
    try {
      return await sessionService.deleteSession(sessionId);
    } catch (err) {
      console.error("Error deleting session courses:", err);
      setError("Erreur lors de la suppression des cours de la session.");
      throw err;
    }
  }
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
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    [teacher]
  );

  const fetchCourses = useCallback(
    async (sessionId: string): Promise<Course[]> => {
      try {
        const courses = await sessionService.getSessionCourses(sessionId);

        setError(null);
        return courses || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue. Merci de réessayer.");
        return [];
      }
    },
    []
  );

  const updateCourse = useCallback(
    async (
      courseId: string,
      title: string,
      description: string | null,
      contentText: string | null
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
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    []
  );

  const handleGetCoursesCount = async (sessionId: string): Promise<number> => {
    try {
      const { coursesCount } = await sessionService.getSessionCoursesCount(sessionId);
      return coursesCount;
    } catch (err) {
      console.error("Error counting cours:", err);
      throw err;
    }
  }

  const handleCreateCourse = async (coursData: InsertCourse): Promise<Course> => {
    try {
      const { data } = await courseService.createCourse(coursData);
      return data;
    } catch (err) {
      console.error("Error creating course:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
      throw err;
    }
  }


  const handleUploadPdfForCours = async (courseId: string, file: File): Promise<CourseFile> => {
    try {
      const { data } = await courseService.uploadFile(courseId, file);
      return data;
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError("Une erreur est survenue. Merci de réessayer.");
      throw err;
    }
  }

  const uploadPdfForCourse = useCallback(
    async (courseId: string, file: File): Promise<CourseFile> => {
      try {
        const fileData = await handleUploadPdfForCours(courseId, file);
        return fileData;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue lors de l'upload.");
        throw err;
      }
    },
    []
  );

  const fetchCourseFiles = useCallback(
    async (courseId: string): Promise<CourseFile[]> => {
      try {
        const fileData = await courseService.getCoursesFiles(courseId);

        return fileData;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const createCourse = useCallback(
    async (
      sessionId: string,
      title: string,
      description: string,
      contentText: string,
      pdfFiles?: File[]
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
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    [uploadPdfForCourse]
  );

  const deleteCourseFile = useCallback(
    async (fichier: CourseFile): Promise<boolean> => {
      try {
        const { error: storageError } = await supabase.storage
          .from("cours-pdf")
          .remove([fichier.fileUrl]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          setError("Erreur lors de la suppression du fichier.");
          return false;
        }

        const { error: deleteError } = await supabase
          .from("course_files")
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
    async (courseId: string): Promise<Question[]> => {
      try {
        const questionsData = await questionService.getCourseQuestions(courseId);

        return questionsData;
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
      updates: UpdateQuestionRequest
    ): Promise<Question | null> => {
      try {
        const { question } = await questionService.updateQuestion(questionId, updates);

        setError(null);
        return question
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
        await questionService.deleteQuestion(questionId);

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
      courseId: string,
      questionData: Omit<CreateQuestionRequest, "courseId">
    ): Promise<Question | null> => {
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
        setError("Une erreur est survenue. Merci de réessayer.");
        return null;
      }
    },
    []
  );

  const generateQuestions = useCallback(
    async (
      courseId: string,
      config?: GenerateQuestionsConfig
    ): Promise<{ success: boolean; questionCount?: number; questions?: Question[]; error?: string }> => {
      try {
        const { questions, questionCount } = await questionService.generateQuestions(courseId, config);

        return {
          success: true,
          questionCount,
          questions,
        };
      } catch (err) {
        console.error("Error generating questions:", err);
        return { success: false, error: "Erreur de connexion au serveur" };
      }
    },
    []
  );

  const validateQuestions = useCallback(
    async (courseId: string): Promise<{ success: boolean; cours?: Course; error?: string }> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          return { success: false, error: "Vous devez être connecté" };
        }

        const response = await fetch(`/api/cours/${courseId}/validate-questions`, {
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

        return {
          success: true,
          cours: data.cours as Course | undefined,
        };
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
          .from("student_sessions")
          .select(`
            joined_at,
            students (
              id,
              name,
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
          const studentRow = row.students as unknown as {
            id: string;
            name: string;
            email: string;
            photo_url: string | null;
          } | null;
          if (studentRow) {
            participants.push({
              studentId: studentRow.id,
              name: studentRow.name,
              email: studentRow.email,
              photoUrl: studentRow.photo_url,
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

  const fetchCourseRanking = useCallback(
    async (courseId: string): Promise<CourseRanking[]> => {
      try {

        const rankingData = await courseService.getCourseRanking(courseId);

        return rankingData;
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const fetchQuestionsCourseForCourse = useCallback(
    async (courseId: string): Promise<CourseQuestion[]> => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error("No access token available");
          return [];
        }

        const response = await fetch(`/api/cours/${courseId}/questions-cours`, {
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
        return (Array.isArray(data) ? data : []) as CourseQuestion[];
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
        const { count } = await questionService.getPendingQuestionsCount(sessionId)
        return count || 0;
      } catch (err) {
        console.error("Unexpected error:", err);
        return 0;
      }
    },
    []
  );

  const answerQuestionCourse = useCallback(
    async (questionId: string, reponse: string): Promise<CourseQuestion | null> => {
      try {
        const { data, error: updateError } = await supabase
          .from("course_questions")
          .update({
            answer: reponse,
            answered_at: new Date().toISOString(),
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
        return courseQuestionFromRow(data as CourseQuestionsTableRow);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Une erreur est survenue.");
        return null;
      }
    },
    []
  );

  const deleteQuestionCourse = useCallback(
    async (questionId: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from("course_questions")
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
        setError("Une erreur est survenue. Merci de réessayer.");
        return false;
      }
    },
    []
  );

  const deleteCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        await courseService.deleteCourse(courseId);

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
          position_order: index,
        }));

        for (const update of updates) {
          await updateQuestion(update.id, { positionOrder: update.position_order });
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
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    reorderCourse,
    uploadPdfForCourse,
    fetchCourseFiles,
    deleteCourseFile,
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
    fetchCourseRanking,
    fetchQuestionsCourseForCourse,
    fetchPendingQuestionsCount,
    answerQuestionCourse,
    deleteQuestionCourse,
  };
}
