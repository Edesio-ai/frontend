"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
} from "@/components/ui/tabs";

import { useAuth } from "@/hooks/use-auth";
import { useTeacher } from "@/hooks/use-teacher";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { useToast } from "@/hooks/use-toast";
import type { Session, Course, SessionStudent } from "@/types";
import {
  LogOut,
  Loader2,
  AlertCircle,
  UserCog,
  BookOpen,
  GraduationCap,
  Lightbulb
} from "lucide-react";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { ToolBar } from "@/components/teacher/ToolBar";
import { CreateModal } from "@/components/teacher/CreateModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSessionFormValues } from "@/types/zod.type";
import { createSessionFormSchema } from "@/utils/constants/zod";
import { ClassListSection } from "@/components/teacher/section/classListSection";
import { TabsListHeader } from "@/components/teacher/tabs/TabsList";
import { CourseTab } from "@/components/teacher/tabs/CourseTab";
import { StudentTab } from "@/components/teacher/tabs/StudentTab";
import { QuestionCourseTab } from "@/components/teacher/tabs/QuestionCourseTab";

export default function Teacher() {
  const { user, loading: authLoading, logout, getUserRole } = useAuth();
  const {
    teacher,
    sessions,
    loading: profLoading,
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
    refreshSessions,
    fetchSessionStudents,
    fetchCourseRanking,
    fetchQuestionsCourseForCourse,
    fetchPendingQuestionsCount,
    answerQuestionCourse,
    deleteQuestionCourse,
  } = useTeacher();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);


  const [sessionTab, setSessionTab] = useState<"course" | "students" | "qa">("course");
  const [sessionStudents, setSessionStudents] = useState<SessionStudent[]>([]);
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
    if (!authLoading && (!user || role !== "teacher")) {
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
        })
      );
      setSessionPendingCounts(counts);
    };

    fetchAllPendingCounts();
  }, [sessions, fetchPendingQuestionsCount]);

  const refreshPendingCount = async (sessionId: string) => {
    const count = await fetchPendingQuestionsCount(sessionId);
    setSessionPendingCounts(prev => ({ ...prev, [sessionId]: count }));
    if (selectedSession?.id === sessionId) {
      setPendingQuestionsCount(count);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
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
    console.log("🚀 ~ handleTabChange ~ tab:", tab)
    setSessionTab(tab);
    if (tab === "students" && selectedSession && sessionStudents.length === 0) {
      loadSessionStudents(selectedSession.id);
    }
  };

  const handleRenameSession = async (sessionId: string, newName: string): Promise<Session | null> => {
    const updatedSession = await updateSession(sessionId, newName);
    if (updatedSession) {
      toast({
        title: "Session renommée",
        description: `La session a été renommée en "${newName}".`,
      });
      if (selectedSession?.id === sessionId) {
        setSelectedSession(updatedSession);
      }
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de renommer la session.",
        variant: "destructive",
      });
    }
    return updatedSession;
  };

  const handleDeleteSession = async (sessionId: string): Promise<boolean> => {
    const success = await deleteSession(sessionId);
    if (success) {
      toast({
        title: "Session supprimée",
        description: "La session et tous ses cours ont été supprimés.",
      });
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la session.",
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


  if (authLoading || profLoading || !user || role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const firstName = user.metadata?.firstName || teacher?.name || "Professeur";

  return (
    <SubscriptionBlockModal>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <img src="/edesio-logo-square.png" alt="Edesio" className="w-10 h-10 rounded-lg object-cover" />
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestionsModal(true)}
                  className="border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400"
                  data-testid="button-suggestions"
                >
                  <Lightbulb className="h-4 w-4 mr-1.5" />
                  Suggestions
                </Button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {firstName}
                  </span>
                </div>
                <Link href="/profil">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="button-profile"
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Profil</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  data-testid="button-logout"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Déconnexion</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <EmailVerificationBanner />
        <MobileInstallBanner onOpenModal={() => setShowInstallModal(true)} />
        <MobileInstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
        <SuggestionsModal open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal} category="teacher" />

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
                  Tableau de bord
                </h1>
                <p className="text-muted-foreground">
                  Créez vos classes et gérez vos cours avec Edesio.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Card className="p-4 mb-6 bg-destructive/10 border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-destructive" data-testid="text-error-message">
                  {error}
                </p>
              </div>
            </Card>
          )}

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
        </main>

        <CreateModal 
        createModalOpen={createModalOpen} 
        form={form} 
        onOpenChange={(open: boolean) => !open && handleCloseCreateModal()} 
        createSession={createSession} 
        createCourse={createCourse} 
        setSelectedPdfFiles={setSelectedPdfFiles}
        selectedPdfFiles={selectedPdfFiles}
        refreshSessions={refreshSessions}
        handleCloseCreateModal={handleCloseCreateModal}
        setSelectedSession={setSelectedSession}
        setNewlyCreatedCourse={setNewlyCreatedCourse}
        />

        <Dialog open={!!selectedSession} onOpenChange={(open) => !open && handleCloseSessionModal()}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary-foreground" />
                </div>
                {selectedSession?.name}
              </DialogTitle>
              <DialogDescription>
                Gérez les cours de cette session et visualisez les élèves inscrits.
              </DialogDescription>
            </DialogHeader>

            {selectedSession && (
              <Tabs value={sessionTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
                <TabsListHeader sessionStudents={sessionStudents} pendingQuestionsCount={pendingQuestionsCount} />
               <CourseTab
                  session={selectedSession}
                  fetchCourses={fetchCourses}
                  createCourse={createCourse}
                  updateCourse={updateCourse}
                  deleteCourse={deleteCourse}
                  reorderCourse={reorderCourse}
                  uploadPdfForCourse={uploadPdfForCourse}
                  fetchCourseFiles={fetchCourseFiles}
                  deleteCourseFile={deleteCourseFile}
                  getPdfUrl={getPdfUrl}
                  fetchQuestions={fetchQuestions}
                  updateQuestion={updateQuestion}
                  deleteQuestion={deleteQuestion}
                  createQuestion={createQuestion}
                  reorderQuestions={reorderQuestions}
                  generateQuestions={generateQuestions}
                  validateQuestions={validateQuestions}
                  fetchCourseRanking={fetchCourseRanking}
                  newlyCreatedCours={newlyCreatedCours}
                  setNewlyCreatedCourse={setNewlyCreatedCourse}
                />
                <StudentTab
                  loadingSessionStudents={loadingSessionStudents}
                  sessionStudents={sessionStudents}
                  selectedSession={selectedSession}
                />
                <QuestionCourseTab
                  sessionId={selectedSession?.id || ""}
                  fetchCourses={fetchCourses}
                  fetchQuestionsCourseForCourse={fetchQuestionsCourseForCourse}
                  answerQuestionCourse={answerQuestionCourse}
                  deleteQuestionCourse={deleteQuestionCourse}
                  onPendingCountChange={() => refreshPendingCount(selectedSession.id)}
                />
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SubscriptionBlockModal>
  );
}
