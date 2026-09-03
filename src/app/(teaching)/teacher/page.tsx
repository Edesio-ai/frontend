"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/client";
import { BookOpen } from "lucide-react";

import { useTeacher } from "./_contexts/teacher-context";
import { useToast } from "@/hooks/use-toast";

import type { Session, Course, StudentSessionWithStudent } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSessionFormValues } from "@/types/zod.type";
import { createSessionFormSchema } from "@/utils/constants/zod";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "@/app/_components/loader";
import { canAccessModule, USER_ROLE } from "@/utils/functions/role.utils";
import { ClassListSection } from "./_components/section/class-list-section";
import { ToolBar } from "./_components/tool-bar";
import { CreateModal } from "./_components/create-modal";
import { SessionWorkspace } from "./_components/session-worspace";
import { ErrorBanner } from "./_components/error-banner";

export default function Teacher() {
  const { user, loading: authLoading, getUserRole } = useAuth();
  const t = useTranslations();
  const {
    sessions,
    loading: profLoading,
    error,
    updateSession,
    deleteSession,
    fetchSessionStudents,
    fetchPendingQuestionsCount,
  } = useTeacher();

  const { toast } = useToast();
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);

  const [sessionTab, setSessionTab] = useState<"course" | "students" | "qa">("course");
  const [sessionStudents, setSessionStudents] = useState<StudentSessionWithStudent[]>([]);
  const [loadingSessionStudents, setLoadingSessionStudents] = useState(false);
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState<number>(0);
  const [sessionPendingCounts, setSessionPendingCounts] = useState<Record<string, number>>({});
  const [newlyCreatedCours, setNewlyCreatedCourse] = useState<Course | null>(null);

  const role = getUserRole();

  const form = useForm<CreateSessionFormValues>({
    resolver: zodResolver(createSessionFormSchema),
    defaultValues: {
      sessionName: "",
      sessionLanguage: "francais",
      courseTitle: "",
      courseDescription: "",
      courseContent: "",
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || !canAccessModule(role, USER_ROLE.teacher))) {
      router.push("/login");
    }
  }, [authLoading, user, role, router]);

  useEffect(() => {
    const fetchAllPendingCounts = async () => {
      if (sessions.length === 0) return;

      const counts: Record<string, number> = {};
      await Promise.all(
        sessions.map(async (session) => {
          const count = await fetchPendingQuestionsCount(session.id);
          counts[session.id] = count;
        }),
      );
      setSessionPendingCounts(counts);
    };

    fetchAllPendingCounts();
  }, [sessions, fetchPendingQuestionsCount]);

  const refreshPendingCount = async (sessionId: string) => {
    const count = await fetchPendingQuestionsCount(sessionId);
    setSessionPendingCounts((prev) => ({ ...prev, [sessionId]: count }));
    if (selectedSession?.id === sessionId) {
      setPendingQuestionsCount(count);
    }
  };

  const handleSelectSession = async (session: Session) => {
    setSelectedSession(session);
    setSessionTab("course");
    setSessionStudents([]);
    setPendingQuestionsCount(0);
    const count = await fetchPendingQuestionsCount(session.id);
    setPendingQuestionsCount(count);
  };

  const handleCloseSessionModal = () => {
    setSelectedSession(null);
    setSessionTab("course");
    setSessionStudents([]);
    setPendingQuestionsCount(0);
    setNewlyCreatedCourse(null);
  };

  const loadSessionStudents = async (sessionId: string) => {
    setLoadingSessionStudents(true);
    const result = await fetchSessionStudents(sessionId);
    setSessionStudents(result);
    setLoadingSessionStudents(false);
  };

  const handleTabChange = (value: string) => {
    const tab = value as "course" | "students" | "qa";
    setSessionTab(tab);
    if (tab === "students" && selectedSession && sessionStudents.length === 0) {
      loadSessionStudents(selectedSession.id);
    }
  };

  const handleRenameSession = async (sessionId: string, newName: string): Promise<Session | null> => {
    const updatedSession = await updateSession(sessionId, newName);
    if (updatedSession) {
      toast({
        title: t.hooks.teacher.sessionRenamed,
        description: t.hooks.teacher.sessionRenamedDesc,
      });
      if (selectedSession?.id === sessionId) {
        setSelectedSession(updatedSession);
      }
    } else {
      toast({
        title: t.hooks.teacher.error,
        description: t.hooks.teacher.sessionUpdateError,
        variant: "destructive",
      });
    }
    return updatedSession;
  };

  const handleDeleteSession = async (sessionId: string): Promise<boolean> => {
    const success = await deleteSession(sessionId);
    if (success) {
      toast({
        title: t.hooks.teacher.sessionDeleted,
      });
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } else {
      toast({
        title: t.hooks.teacher.error,
        description: t.hooks.teacher.sessionDeleteError,
        variant: "destructive",
      });
    }
    return success;
  };

  const handleOpenCreateModal = () => {
    form.reset();
    setSelectedPdfFiles([]);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    form.reset();
    setSelectedPdfFiles([]);
    setCreateModalOpen(false);
  };

  if (authLoading || profLoading || !user || !canAccessModule(role, USER_ROLE.teacher)) {
    return <Loader text={t.teacher.loading} />;
  }

  return (
    <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
              data-testid="text-prof-welcome"
            >
              {t.teacher.dashboardTitle}
            </h1>
            <p className="text-muted-foreground">{t.teacher.emptySubtitle}</p>
          </div>
        </div>
      </div>

      {error && <ErrorBanner error={error} />}

      <div className="space-y-8">
        <ToolBar
          setSelectedSession={setSelectedSession}
          handleOpenCreateModal={handleOpenCreateModal}
          sessions={sessions}
        />
        <ClassListSection
          sessions={sessions}
          handleOpenCreateModal={handleOpenCreateModal}
          handleSelectSession={handleSelectSession}
          handleRenameSession={handleRenameSession}
          handleDeleteSession={handleDeleteSession}
          sessionPendingCounts={sessionPendingCounts}
        />
      </div>

      <CreateModal
        createModalOpen={createModalOpen}
        form={form}
        onOpenChange={(open: boolean) => !open && handleCloseCreateModal()}
        setSelectedPdfFiles={setSelectedPdfFiles}
        selectedPdfFiles={selectedPdfFiles}
        handleCloseCreateModal={handleCloseCreateModal}
        setSelectedSession={setSelectedSession}
        setNewlyCreatedCourse={setNewlyCreatedCourse}
      />

      <SessionWorkspace
        selectedSession={selectedSession}
        sessionTab={sessionTab}
        sessionStudents={sessionStudents}
        pendingQuestionsCount={pendingQuestionsCount}
        newlyCreatedCours={newlyCreatedCours}
        setNewlyCreatedCourse={setNewlyCreatedCourse}
        loadingSessionStudents={loadingSessionStudents}
        handleCloseSessionModal={handleCloseSessionModal}
        handleTabChange={handleTabChange}
        refreshPendingCount={refreshPendingCount}
      />
    </main>
  );
}
