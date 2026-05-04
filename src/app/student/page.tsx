"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudent } from "@/hooks/use-student";
import { useToast } from "@/hooks/use-toast";

import { SuggestionsModal } from "@/components/SuggestionsModal";
import {
  MessageSquare,
  BookOpen,
  LogOut,
  Loader2,
  Plus,
  Sparkles,
  UserCog,
  ChevronRight,
  GraduationCap,
  KeyRound,
  Calendar,
  AlertCircle,
  X,
  Target,
  Camera,
  Trophy,
  Award,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { useAuth } from "@/hooks/use-auth";
import { StudentChatbotModal } from "@/components/student/StudentChatboModal";
import { StudentQAModal } from "@/components/student/StudantQAModal";
import { Course, CourseRanking, Question, Session } from "@/types";
import { JoinSessionModal } from "@/components/student/JoinSessionModal";

interface JoinedSession extends Session {
  joinedAt: string;
}

export default function Student() {
  const { user, loading: authLoading, logout, getUserRole } = useAuth();
  const {
    student,
    joinedSessions,
    loading: eleveLoading,
    error: eleveError,
    joinSessionByCode,
    fetchCourse,
    fetchQuestions,
    leaveSession,
    uploadProfilePhoto,
    updateCoursProgress,
    fetchCoursClassement,
    askQuestionCours,
    fetchQuestionsCoursForCours,
    countAnsweredQuestionsForCourse,
  } = useStudent();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionCourses, setSessionCourses] = useState<Record<string, Course[]>>({});
  const [loadingCourses, setLoadingCourses] = useState<Record<string, boolean>>({});
  const [selectedCoursIdPerSession, setSelectedCoursIdPerSession] = useState<Record<string, string>>({});

  const [selectedCours, setSelectedCours] = useState<Course | null>(null);
  const [coursQuestions, setCoursQuestions] = useState<Question[]>([]);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [sessionToLeave, setSessionToLeave] = useState<JoinedSession | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const [rankingsModalOpen, setRankingsModalOpen] = useState(false);
  const [selectedCoursForRankings, setSelectedCoursForRankings] = useState<Course | null>(null);
  const [rankings, setRankings] = useState<CourseRanking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);

  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [selectedCoursForQA, setSelectedCoursForQA] = useState<Course | null>(null);
  const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState<Record<string, number>>({});

  const role = getUserRole();

  useEffect(() => {
    if (!authLoading && (!user || role !== "student")) {
      router.push("/login");
    }
  }, [authLoading, user, role, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const result = await uploadProfilePhoto(file);
    
    if (result.success) {
      toast({
        title: "Photo mise à jour",
        description: "Ta photo de profil a été enregistrée.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de mettre à jour la photo.",
        variant: "destructive",
      });
    }
    
    setIsUploadingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      setJoinError("Veuillez entrer un code de session.");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    const result = await joinSessionByCode(joinCode.trim());

    if (result.success) {
      setJoinModalOpen(false);
      setJoinCode("");
    } else {
      setJoinError(result.error || "Une erreur est survenue.");
    }

    setIsJoining(false);
  };

  const handleExpandSession = useCallback(
    async (sessionId: string) => {
      if (expandedSessionId === sessionId) {
        setExpandedSessionId(null);
        setSelectedCoursIdPerSession(prev => {
          const next = { ...prev };
          delete next[sessionId];
          return next;
        });
        return;
      }

      setExpandedSessionId(sessionId);

      if (!sessionCourses[sessionId]) {
        setLoadingCourses((prev) => ({ ...prev, [sessionId]: true }));
        const courses = await fetchCourse(sessionId);
        setSessionCourses((prev) => ({ ...prev, [sessionId]: courses }));
        setLoadingCourses((prev) => ({ ...prev, [sessionId]: false }));
        
        for (const cours of courses) {
          const count = await countAnsweredQuestionsForCourse();
          if (count > 0) {
            setAnsweredQuestionsCount((prev) => ({ ...prev, [cours.id]: count }));
          }
        }
      }
    },
    [expandedSessionId, sessionCourses, fetchCourse, countAnsweredQuestionsForCourse]
  );

  const handleOpenChatbot = async (cours: Course) => {
    setSelectedCours(cours);
    setLoadingQuestions(true);
    const questions = await fetchQuestions(cours.id);
    setCoursQuestions(questions);
    setLoadingQuestions(false);
    setChatbotOpen(true);
  };

  const handleOpenRankings = async (cours: Course) => {
    setSelectedCoursForRankings(cours);
    setRankingsModalOpen(true);
    setLoadingRankings(true);
    const rankingsData = await fetchCoursClassement(cours.id);
    setRankings(rankingsData);
    setLoadingRankings(false);
  };

  const handleOpenQA = (cours: Course) => {
    setSelectedCoursForQA(cours);
    setQaModalOpen(true);
  };

  const handleLeaveSession = async () => {
    if (!sessionToLeave) return;

    setIsLeaving(true);
    const success = await leaveSession(sessionToLeave.id);
    if (success) {
      setSessionCourses((prev) => {
        const updated = { ...prev };
        delete updated[sessionToLeave.id];
        return updated;
      });
      setSelectedCoursIdPerSession(prev => {
        const next = { ...prev };
        delete next[sessionToLeave.id];
        return next;
      });
      if (expandedSessionId === sessionToLeave.id) {
        setExpandedSessionId(null);
      }
    }
    setIsLeaving(false);
    setLeaveModalOpen(false);
    setSessionToLeave(null);
  };

  if (authLoading || eleveLoading || !user || role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500/5 via-background to-indigo-500/10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const firstname = user.metadata?.firstname || "Élève";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-indigo-500/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {firstname}
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
      <SuggestionsModal open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal} category="student" />

      <main className="relative max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          data-testid="input-profile-photo"
        />
        
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isUploadingPhoto) {
                  fileInputRef.current?.click();
                }
              }}
              className="relative group cursor-pointer"
              data-testid="button-upload-photo"
            >
              <Avatar className="w-16 h-16 border-2 border-green-500/30 shadow-lg shadow-green-500/20">
                {student?.photoUrl ? (
                  <AvatarImage src={student.photoUrl} alt={firstname} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xl font-bold">
                  {firstname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploadingPhoto ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                {isUploadingPhoto ? (
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                ) : (
                  <Camera className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold"
                data-testid="text-student-welcome"
              >
                Salut, {firstname} !
              </h1>
              <p className="text-muted-foreground">
                Prêt à réviser avec Edesio ?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{joinedSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Classe{joinedSessions.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(sessionCourses).flat().length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Cours</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {eleveError && (
          <Card className="p-4 mb-6 border-destructive/50 bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{eleveError}</p>
            </div>
          </Card>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Mes classes</h2>
                <p className="text-sm text-muted-foreground">Clique sur une classe pour voir les cours</p>
              </div>
            </div>
            <Button
              onClick={() => setJoinModalOpen(true)}
              className="shadow-lg shadow-primary/25"
              data-testid="button-join-session"
            >
              <Plus className="h-4 w-4 mr-2" />
              Rejoindre
            </Button>
          </div>

          {joinedSessions.length === 0 ? (
            <Card className="p-10 text-center bg-card/50 backdrop-blur-sm border-dashed">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Aucune classe rejointe</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Demande un code à ton professeur pour rejoindre une classe et commencer à apprendre avec l'IA.
              </p>
              <Button
                onClick={() => setJoinModalOpen(true)}
                className="shadow-lg shadow-primary/25"
                data-testid="button-join-session-empty"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Entrer un code
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {joinedSessions.map((session, index) => {
                const colors = [
                  { bg: "from-indigo-500/10 to-indigo-600/5", border: "border-indigo-500/20", icon: "text-indigo-600", iconBg: "bg-indigo-500/20" },
                  { bg: "from-green-500/10 to-green-600/5", border: "border-green-500/20", icon: "text-green-600", iconBg: "bg-green-500/20" },
                  { bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20", icon: "text-purple-600", iconBg: "bg-purple-500/20" },
                  { bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20", icon: "text-orange-600", iconBg: "bg-orange-500/20" },
                  { bg: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/20", icon: "text-pink-600", iconBg: "bg-pink-500/20" },
                ];
                const color = colors[index % colors.length];

                return (
                  <Card
                    key={session.id}
                    className={`overflow-hidden bg-gradient-to-br ${color.bg} ${color.border}`}
                    data-testid={`card-session-${session.id}`}
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover-elevate"
                      onClick={() => handleExpandSession(session.id)}
                      data-testid={`button-expand-session-${session.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${color.iconBg} flex items-center justify-center`}>
                          <BookOpen className={`h-6 w-6 ${color.icon}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{session.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Rejoint le{" "}
                              {new Date(session.joinedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sessionCourses[session.id] && (
                          <Badge variant="secondary" className="bg-background/50">
                            {sessionCourses[session.id].length} cours
                          </Badge>
                        )}
                        <ChevronRight
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            expandedSessionId === session.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {expandedSessionId === session.id && (
                      <div className="border-t bg-background/50 p-4">
                        {loadingCourses[session.id] ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">
                              Chargement des cours...
                            </span>
                          </div>
                        ) : sessionCourses[session.id]?.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Aucun cours disponible pour le moment.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <Sparkles className="h-3 w-3" />
                                Sélectionne un cours pour réviser avec Edesio
                              </p>
                              <Select
                                value={selectedCoursIdPerSession[session.id] || ""}
                                onValueChange={(value) => {
                                  setSelectedCoursIdPerSession(prev => ({
                                    ...prev,
                                    [session.id]: value
                                  }));
                                }}
                              >
                                <SelectTrigger 
                                  className="w-full"
                                  data-testid={`select-cours-${session.id}`}
                                >
                                  <SelectValue placeholder="Choisis un cours..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {sessionCourses[session.id]?.map((cours) => (
                                    <SelectItem 
                                      key={cours.id} 
                                      value={cours.id}
                                      className="py-3"
                                      data-testid={`select-cours-item-${cours.id}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span>{cours.title}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedCoursIdPerSession[session.id] && (() => {
                              const selectedCoursForActions = sessionCourses[session.id]?.find(
                                c => c.id === selectedCoursIdPerSession[session.id]
                              );
                              if (!selectedCoursForActions) return null;
                              
                              return (
                                <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                  <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shrink-0">
                                      <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm">{selectedCoursForActions.title}</p>
                                      {selectedCoursForActions.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                          {selectedCoursForActions.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => handleOpenChatbot(selectedCoursForActions)}
                                      data-testid={`button-cours-${selectedCoursForActions.id}`}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Réviser
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shrink-0 relative"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenQA(selectedCoursForActions);
                                      }}
                                      data-testid={`button-qa-${selectedCoursForActions.id}`}
                                      title="Questions & Réponses"
                                    >
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      Q&R
                                      {answeredQuestionsCount[selectedCoursForActions.id] > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-amber-400 text-[10px] font-bold text-amber-900 flex items-center justify-center px-1 shadow-sm">
                                          {answeredQuestionsCount[selectedCoursForActions.id]}
                                        </span>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenRankings(selectedCoursForActions);
                                      }}
                                      data-testid={`button-rankings-${selectedCoursForActions.id}`}
                                      title="Classement"
                                    >
                                      <Trophy className="h-4 w-4 mr-1" />
                                      Classement
                                    </Button>
                                  </div>
                                </Card>
                              );
                            })()}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToLeave(session);
                              setLeaveModalOpen(true);
                            }}
                            data-testid={`button-leave-session-${session.id}`}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Quitter cette session
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <JoinSessionModal
        joinModalOpen={joinModalOpen}
        setJoinModalOpen={setJoinModalOpen}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        joinError={joinError}
        setJoinError={setJoinError}
        handleJoinSession={handleJoinSession}
        isJoining={isJoining}
      />

      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent data-testid="modal-leave-session">
          <DialogHeader>
            <DialogTitle className="text-destructive">Quitter la session ?</DialogTitle>
            <DialogDescription>
              Tu ne pourras plus accéder aux cours de "{sessionToLeave?.name}". Tu pourras
              rejoindre à nouveau la session avec le code.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setLeaveModalOpen(false);
                setSessionToLeave(null);
              }}
              data-testid="button-cancel-leave"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLeaveSession}
              disabled={isLeaving}
              data-testid="button-confirm-leave"
            >
              {isLeaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Quitter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rankingsModalOpen} onOpenChange={(open) => {
        setRankingsModalOpen(open);
        if (!open) {
          setSelectedCoursForRankings(null);
          setRankings([]);
        }
      }}>
        <DialogContent className="sm:max-w-md" data-testid="modal-rankings">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Classement
            </DialogTitle>
            <DialogDescription>
              {selectedCoursForRankings?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingRankings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto opacity-30 mb-3" />
                <p className="text-sm">Personne n'a encore participé à ce cours.</p>
                <p className="text-xs mt-1">Sois le premier à réviser !</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {rankings.map((ranking) => {
                  const isCurrentUser = student && student.id === ranking.studentId;
                  return (
                    <Card 
                      key={ranking.studentId}
                      className={`p-3 flex items-center gap-3 ${isCurrentUser ? 'border-primary bg-primary/5' : ''}`}
                      data-testid={`ranking-student-${ranking.studentId}`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold shrink-0">
                        {ranking.rank === 1 ? (
                          <Award className="h-5 w-5 text-yellow-500" />
                        ) : ranking.rank === 2 ? (
                          <Award className="h-5 w-5 text-gray-400" />
                        ) : ranking.rank === 3 ? (
                          <Award className="h-5 w-5 text-amber-600" />
                        ) : (
                          <span className="text-muted-foreground">{ranking.rank}</span>
                        )}
                      </div>
                      <Avatar className="h-8 w-8 border shrink-0">
                        <AvatarImage src={ranking.photoUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {ranking.name?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {ranking.name}
                          {isCurrentUser && <span className="text-xs text-primary ml-1">(Toi)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ranking.correctAnswers}/{ranking.attemptedQuestions} réponses correctes
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-bold text-sm ${isCurrentUser ? 'text-primary' : ''}`}>
                          {Math.round(ranking.successRate)}%
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedCours && chatbotOpen && (
        <StudentChatbotModal
          key={selectedCours.id}
          open={chatbotOpen}
          onOpenChange={setChatbotOpen}
          cours={selectedCours}
          questions={coursQuestions}
          studentName={firstname}
          studentPhotoUrl={student?.photoUrl}
          onComplete={async (totalAnswered, correctAnswers) => {
            console.log("onComplete called:", { totalAnswered, correctAnswers, coursId: selectedCours.id });
            const result = await updateCoursProgress(selectedCours.id, totalAnswered, correctAnswers);
            console.log("updateCoursProgress result:", result);
            if (result.success) {
              toast({
                title: "Progression enregistrée",
                description: `Score : ${correctAnswers}/${totalAnswered}`,
              });
            } else {
              console.error("Failed to save progress:", result.error);
              toast({
                title: "Erreur",
                description: result.error || "Impossible d'enregistrer la progression",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      {selectedCoursForQA && (
        <StudentQAModal
          open={qaModalOpen}
          onOpenChange={setQaModalOpen}
          cours={selectedCoursForQA}
          fetchQuestionsCoursForCours={fetchQuestionsCoursForCours}
          askQuestionCours={askQuestionCours}
        />
      )}

      {loadingQuestions && (
        <Dialog open={loadingQuestions} onOpenChange={() => {}}>
          <DialogContent className="max-w-xs">
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Préparation du chatbot...</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
