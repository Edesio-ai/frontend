"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useTeacher} from "@/hooks/use-teacher";
import { SessionCard, CourseList, QuestionsCoursePanel } from "@/components/dashboard";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { useToast } from "@/hooks/use-toast";
import type { Session, SessionParticipant, SessionLanguage, Course } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LogOut, 
  Loader2, 
  Users, 
  AlertCircle,
  UserCog, 
  BookOpen, 
  Plus, 
  Search, 
  FileText, 
  ChevronRight,
  Upload,
  X,
  Sparkles,
  GraduationCap,
  Globe,
  MessageCircle,
  Lightbulb
} from "lucide-react";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

const langueLabels: Record<SessionLanguage, string> = {
  francais: "Français",
  anglais: "Anglais",
  espagnol: "Espagnol",
  allemand: "Allemand",
};

const createSessionFormSchema = z.object({
  sessionNom: z.string().min(1, "Le nom de la session est requis").max(100, "Le nom est trop long"),
  sessionLangue: z.enum(["francais", "anglais", "espagnol", "allemand"]),
  coursTitre: z.string().min(1, "Le titre du cours est requis").max(200, "Le titre est trop long"),
  coursDescription: z.string().max(500, "La description est trop longue").optional().or(z.literal("")),
  coursContenu: z.string().optional().or(z.literal("")),
});

type CreateSessionFormValues = z.infer<typeof createSessionFormSchema>;

export default function Professeur() {
  const { user, loading: authLoading, logout, getUserRole } = useAuth();
  const {
    professeur,
    sessions,
    loading: profLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    fetchCours,
    createCours,
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
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Session[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
      sessionNom: "",
      sessionLangue: "francais",
      coursTitre: "",
      coursDescription: "",
      coursContenu: "",
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== "teacher")) {
      router.push("/login");
    }
  }, [authLoading, user, role, router]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = sessions.filter(
        (session) => session.nom.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, sessions]);

 
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedPdfFiles((prev) => [...prev, ...Array.from(files)]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedPdfFiles((prev) => prev.filter((_, i) => i !== index));
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

  const onCreateSubmit = async (data: CreateSessionFormValues) => {
    setIsCreating(true);
    
    try {
      const newSession = await createSession(data.sessionNom, data.sessionLangue);
      
      if (!newSession) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la session. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }
      
      const newCours = await createCours(
        newSession.id,
        data.coursTitre,
        data.coursDescription || "",
        data.coursContenu || "",
        selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined
      );
      
      await refreshSessions();
      handleCloseCreateModal();
      
      if (!newCours) {
        toast({
          title: "Attention",
          description: "La session a été créée mais le cours n'a pas pu être ajouté. Vous pouvez l'ajouter manuellement.",
          variant: "destructive",
        });
        setSelectedSession(newSession);
      } else {
        toast({
          title: "Succès",
          description: "Session et cours créés avec succès !",
        });
        setNewlyCreatedCours(newCours);
        setSelectedSession(newSession);
      }
    } catch (err) {
      console.error("Error in creation flow:", err);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectSearchResult = (session: Session) => {
    setSearchQuery("");
    setSelectedSession(session);
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

  const firstName = user.user_metadata?.firstName || professeur?.nom || "Professeur";

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
          <section>
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl" data-testid="card-search-and-create">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une classe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                    data-testid="input-search-sessions"
                  />
                  
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Aucune classe trouvée pour "{searchQuery}"
                        </div>
                      ) : (
                        <div className="py-2">
                          {searchResults.map((session) => (
                            <button
                              key={session.id}
                              className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3"
                              onClick={() => handleSelectSearchResult(session)}
                              data-testid={`search-result-${session.id}`}
                            >
                              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{session.nom}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  Code: {session.code}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleOpenCreateModal} 
                  className="shadow-lg shadow-primary/25"
                  data-testid="button-open-create-modal"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle classe
                </Button>
              </div>
            </Card>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Mes classes</h2>
                <p className="text-sm text-muted-foreground">{sessions.length} classe{sessions.length > 1 ? 's' : ''} créée{sessions.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {sessions.length === 0 ? (
              <Card className="p-10 text-center bg-card/50 backdrop-blur-sm border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aucune classe créée</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Créez votre première classe pour commencer à ajouter des cours et générer des questions IA.
                </p>
                <Button onClick={handleOpenCreateModal} className="shadow-lg shadow-primary/25" data-testid="button-create-first-session">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première classe
                </Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isSelected={false}
                    onSelect={handleSelectSession}
                    onRename={handleRenameSession}
                    onDelete={handleDeleteSession}
                    pendingQuestionsCount={sessionPendingCounts[session.id] || 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Dialog open={createModalOpen} onOpenChange={(open) => !open && handleCloseCreateModal()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </div>
              Créer une nouvelle classe
            </DialogTitle>
            <DialogDescription>
              Créez une classe et ajoutez votre premier cours en même temps.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Classe
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="sessionNom"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Nom de la classe</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 3ème B – Histoire"
                              {...field}
                              data-testid="input-new-session-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sessionLangue"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-44">
                          <FormLabel>Langue du cours</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-new-session-language">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Langue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.keys(langueLabels) as SessionLanguage[]).map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                  {langueLabels[lang]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Premier cours
                  </h4>
                  
                  <FormField
                    control={form.control}
                    name="coursTitre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du cours</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: La Révolution française"
                            {...field}
                            data-testid="input-new-course-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coursDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description courte <span className="text-muted-foreground font-normal">(optionnel)</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Introduction aux causes et conséquences"
                            {...field}
                            data-testid="input-new-course-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Fichiers PDF</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Ajoutez un ou plusieurs fichiers PDF contenant le contenu du cours
                    </p>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={fileInputRef}
                        multiple
                        data-testid="input-new-course-pdf"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-select-pdf-new"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedPdfFiles.length > 0 ? "Ajouter d'autres PDFs" : "Sélectionner des PDFs"}
                      </Button>
                      {selectedPdfFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPdfFiles.map((file, index) => (
                            <div
                              key={`${file.name}-${file.size}-${index}`}
                              className="flex items-center gap-2 text-sm bg-primary/10 border border-primary/20 rounded-md px-2 py-1"
                            >
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <span className="max-w-[200px] truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => removeSelectedFile(index)}
                                data-testid={`button-remove-pdf-new-${index}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="coursContenu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contenu texte additionnel
                          <span className="text-muted-foreground font-normal ml-2">(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Vous pouvez ajouter du texte supplémentaire ici, ou laisser vide si vous utilisez uniquement des PDFs..."
                            className="min-h-[100px] resize-y"
                            {...field}
                            data-testid="textarea-new-course-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseCreateModal}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isCreating} className="shadow-lg shadow-primary/25" data-testid="button-create-session-and-course">
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Créer la session et le cours
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && handleCloseSessionModal()}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              {selectedSession?.nom}
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
                    createCours={createCours}
                    updateCours={updateCours}
                    deleteCours={deleteCours}
                    reorderCours={reorderCours}
                    uploadPdfForCours={uploadPdfForCours}
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
                          key={participant.eleve_id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border"
                          data-testid={`participant-${participant.eleve_id}`}
                        >
                          <Avatar className="h-10 w-10">
                            {participant.photo_url ? (
                              <AvatarImage src={participant.photo_url} alt={participant.nom} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {participant.nom.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{participant.nom}</p>
                            <p className="text-sm text-muted-foreground truncate">{participant.email}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>Inscrit le</p>
                            <p>{new Date(participant.joined_at).toLocaleDateString("fr-FR")}</p>
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
