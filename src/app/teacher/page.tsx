"use client";

import { useEffect, useState, useRef } from "react";
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/hooks/use-auth";
import { useTeacher } from "@/hooks/use-teacher";
import { CourseList, QuestionsCoursePanel } from "@/components/dashboard";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { useToast } from "@/hooks/use-toast";
import type { Session, SessionParticipant, SessionLanguage, Course } from "@/types";
import {
  LogOut,
  Loader2,
  Users,
  AlertCircle,
  UserCog,
  BookOpen,
  Plus,
  GraduationCap,
  MessageCircle,
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
    fetchCours,
    createCourse,
    updateCours,
    deleteCours,
    reorderCours,
    uploadPdfForCourse,
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
    refreshSessions,
    fetchSessionParticipants,
    fetchCoursClassement,
    fetchQuestionsCoursForCours,
    fetchPendingQuestionsCount,
    answerQuestionCours,
    deleteQuestionCours,
  } = useTeacher();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);


  const [sessionTab, setSessionTab] = useState<"cours" | "eleves" | "qa">("cours");
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState<number>(0);
  const [sessionPendingCounts, setSessionPendingCounts] = useState<Record<string, number>>({});
  const [newlyCreatedCours, setNewlyCreatedCours] = useState<Course | null>(null);

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
    setSessionTab("cours");
    setParticipants([]);
    setPendingQuestionsCount(0);
    const count = await fetchPendingQuestionsCount(session.id);
    setPendingQuestionsCount(count);
  };

  const handleCloseSessionModal = () => {
    setSelectedSession(null);
    setSessionTab("cours");
    setParticipants([]);
    setPendingQuestionsCount(0);
    setNewlyCreatedCours(null);
  };

  const loadParticipants = async (sessionId: string) => {
    setLoadingParticipants(true);
    const result = await fetchSessionParticipants(sessionId);
    setParticipants(result);
    setLoadingParticipants(false);
  };

  const handleTabChange = (value: string) => {
    const tab = value as "cours" | "eleves" | "qa";
    setSessionTab(tab);
    if (tab === "eleves" && selectedSession && participants.length === 0) {
      loadParticipants(selectedSession.id);
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

  const firstName = user.user_metadata?.firstName || teacher?.nom || "Professeur";

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
        setNewlyCreatedCours={setNewlyCreatedCours}
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
                <TabsList className="mx-6 mt-4 w-fit" data-testid="session-tabs">
                  <TabsTrigger value="cours" data-testid="tab-cours">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Course
                  </TabsTrigger>
                  <TabsTrigger value="eleves" data-testid="tab-eleves">
                    <Users className="h-4 w-4 mr-2" />
                    Élèves ({participants.length || "..."})
                  </TabsTrigger>
                  <TabsTrigger value="qa" data-testid="tab-qa" className="relative">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Questions
                    {pendingQuestionsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                        {pendingQuestionsCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cours" className="flex-1 overflow-y-auto m-0 mt-0">
                  <div className="p-6">
                    <CourseList
                      session={selectedSession}
                      fetchCours={fetchCours}
                      createCourse={createCourse}
                      updateCours={updateCours}
                      deleteCours={deleteCours}
                      reorderCours={reorderCours}
                      uploadPdfForCourse={uploadPdfForCourse}
                      fetchCoursFichiers={fetchCoursFichiers}
                      deleteCoursFichier={deleteCoursFichier}
                      getPdfUrl={getPdfUrl}
                      fetchQuestions={fetchQuestions}
                      updateQuestion={updateQuestion}
                      deleteQuestion={deleteQuestion}
                      createQuestion={createQuestion}
                      reorderQuestions={reorderQuestions}
                      generateQuestions={generateQuestions}
                      validateQuestions={validateQuestions}
                      fetchCoursClassement={fetchCoursClassement}
                      onClose={handleCloseSessionModal}
                      initialCoursToOpen={newlyCreatedCours}
                      onInitialCoursOpened={() => setNewlyCreatedCours(null)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="eleves" className="flex-1 overflow-y-auto m-0 mt-0">
                  <div className="p-6">
                    {loadingParticipants ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : participants.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Aucun élève inscrit</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Partagez le code <span className="font-mono font-semibold text-primary">{selectedSession.code}</span> avec vos élèves pour qu'ils rejoignent cette session.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div
                            key={participant.studentId}
                            className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border"
                            data-testid={`participant-${participant.studentId}`}
                          >
                            <Avatar className="h-10 w-10">
                              {participant.photoUrl ? (
                                <AvatarImage src={participant.photoUrl} alt={participant.name} />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {participant.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{participant.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{participant.email}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>Inscrit le</p>
                              <p>{new Date(participant.joinedAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="flex-1 overflow-y-auto m-0 mt-0">
                  <div className="p-6">
                    <QuestionsCoursePanel
                      sessionId={selectedSession.id}
                      fetchCours={fetchCours}
                      fetchQuestionsCoursForCours={fetchQuestionsCoursForCours}
                      answerQuestionCours={answerQuestionCours}
                      deleteQuestionCours={deleteQuestionCours}
                      onPendingCountChange={() => refreshPendingCount(selectedSession.id)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SubscriptionBlockModal>
  );
}
