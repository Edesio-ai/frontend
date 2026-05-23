'use client';
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelfLearner } from "@/hooks/use-self-learner";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { 
  LogOut, 
  Loader2, 
  AlertCircle, 
  BookOpen,
  UserCog, 
  Plus, 
  Search, 
  FileText, 
  ChevronRight,
  Upload,
  X,
  Sparkles,
  Globe,
  MessageCircle,
  Trash2,
  Eye,
  Send,
  User,
  PenLine,
  Check,
  Trophy,
  Star,
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Pencil,
  Lightbulb
} from "lucide-react";

import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { SelfLearnerChatbotModal } from "@/components/self-learner/self-learner-chatbot-modal";
import { useAuth } from "@/hooks/use-auth";
import { Language, SelfLearnerCourse, SelfLearnerCourseFile, SelfLearnerQuestion } from "@/types";

const langueLabels: Record<Language, string> = {
  francais: "Français",
  anglais: "Anglais",
  espagnol: "Espagnol",
  allemand: "Allemand",
};

const createCoursFormSchema = z.object({
  titre: z.string().min(1, "Le titre du cours est requis").max(200, "Le titre est trop long"),
  contenu: z.string().optional().or(z.literal("")),
  langue: z.enum(["francais", "anglais", "espagnol", "allemand"]),
});

type CreateCoursFormValues = z.infer<typeof createCoursFormSchema>;

export default function SelfLearner() {
  const { user, loading: authLoading, logout, getUserRole } = useAuth();
  const {
    selfLearner,
    cours,
    loading: autoLoading,
    error,
    createSelfLearnerCourse,
    updateCours,
    deleteCours,
    uploadCoursePdf,
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
  } = useSelfLearner();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedCours, setSelectedCours] = useState<SelfLearnerCourse | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingCoursFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SelfLearnerCourse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [coursTab, setCoursTab] = useState<"contenu" | "questions">("contenu");
  const [coursFichiers, setCoursFichiers] = useState<SelfLearnerCourseFile[]>([]);
  const [coursQuestions, setCoursQuestions] = useState<SelfLearnerQuestion[]>([]);
  const [loadingFichiers, setLoadingFichiers] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qcmCount, setQcmCount] = useState(5);
  const [ouverteCount, setOuverteCount] = useState(5);
  
  const [chatbotModalOpen, setChatbotModalOpen] = useState(false);
  const [coursForChatbot, setCoursForChatbot] = useState<SelfLearnerCourse | null>(null);
  
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingAnswerText, setEditingAnswerText] = useState("");
  const [questionsModified, setQuestionsModified] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  
  const [manualQuestionModalOpen, setManualQuestionModalOpen] = useState(false);
  const [manualQuestionType, setManualQuestionType] = useState<'qcm' | 'ouverte'>('ouverte');
  const [manualQuestionText, setManualQuestionText] = useState("");
  const [manualQuestionAnswer, setManualQuestionAnswer] = useState("");
  const [manualQuestionExplication, setManualQuestionExplication] = useState("");
  const [manualQcmPropositions, setManualQcmPropositions] = useState<string[]>(["", "", "", ""]);
  const [isCreatingManualQuestion, setIsCreatingManualQuestion] = useState(false);

  const [isRenamingCours, setIsRenamingCours] = useState(false);
  const [renamingCoursValue, setRenamingCoursValue] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [renameCardModalOpen, setRenameCardModalOpen] = useState(false);
  const [renameCardCoursId, setRenameCardCoursId] = useState<string | null>(null);
  const [renameCardValue, setRenameCardValue] = useState("");
  const [isSavingCardRename, setIsSavingCardRename] = useState(false);

  const role = getUserRole();

  const form = useForm<CreateCoursFormValues>({
    resolver: zodResolver(createCoursFormSchema),
    defaultValues: {
      titre: "",
      contenu: "",
      langue: "francais",
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== "self-learner")) {
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
      const filtered = cours.filter(
        (c) => c.title.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, cours]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/connexion");
  };

  const handleSelectCours = async (c: SelfLearnerCourse) => {
    setSelectedCours(c);
    setCoursTab("contenu");
    setCoursFichiers([]);
    setCoursQuestions([]);
    
    setLoadingFichiers(true);
    const fichiers = await fetchCoursFichiers(c.id);
    setCoursFichiers(fichiers);
    setLoadingFichiers(false);
  };

  // For new course creation - go directly to questions tab
  const handleSelectCoursForQuestions = async (c: SelfLearnerCourse) => {
    setSelectedCours(c);
    setCoursTab("questions");
    setCoursFichiers([]);
    setCoursQuestions([]);
    
    setLoadingFichiers(true);
    const fichiers = await fetchCoursFichiers(c.id);
    setCoursFichiers(fichiers);
    setLoadingFichiers(false);
  };

  // Open dedicated chatbot modal for revision
  const handleReviserCours = (c: SelfLearnerCourse) => {
    setCoursForChatbot(c);
    setChatbotModalOpen(true);
  };

  const handleCloseCoursModal = () => {
    setSelectedCours(null);
    setCoursTab("contenu");
    setCoursFichiers([]);
    setCoursQuestions([]);
    setEditingQuestionId(null);
    setEditingQuestionText("");
    setEditingAnswerText("");
    setQuestionsModified(false);
    setIsRenamingCours(false);
    setRenamingCoursValue("");
    setPdfViewerOpen(false);
    setPdfViewerUrl(null);
  };

  const handleTabChange = async (value: string) => {
    const tab = value as "contenu" | "questions";
    setCoursTab(tab);
    
    if (tab === "questions" && selectedCours && coursQuestions.length === 0) {
      setLoadingQuestions(true);
      const questions = await fetchQuestions(selectedCours.id);
      setCoursQuestions(questions);
      setLoadingQuestions(false);
    }
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

  const handleAddPdfToExistingCours = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedCours) return;
    
    setIsUploadingPdf(true);
    try {
      const pdfFiles = Array.from(files);
      for (const file of pdfFiles) {
        const result = await uploadCoursePdf(selectedCours.id, file);
        if (result) {
          setCoursFichiers((prev) => [...prev, result]);
        }
      }
      toast({
        title: "Succès",
        description: pdfFiles.length > 1 
          ? `${pdfFiles.length} fichiers ajoutés avec succès`
          : "Fichier ajouté avec succès",
      });
    } catch (err) {
      console.error("Error uploading PDF:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fichier. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPdf(false);
      if (existingCoursFileInputRef.current) {
        existingCoursFileInputRef.current.value = "";
      }
    }
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

  const onCreateSubmit = async (data: CreateCoursFormValues) => {
    setIsCreating(true);
    
    try {
      const newCours = await createSelfLearnerCourse(
        data.titre,
        "",
        data.contenu || "",
        data.langue,
        selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined
      );
      
      handleCloseCreateModal();
      
      if (!newCours) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le cours. Veuillez réessayer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Cours créé avec succès !",
        });
        // Open course and go directly to questions tab for generation
        await handleSelectCoursForQuestions(newCours);
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

  const handleSelectSearchResult = (c: SelfLearnerCourse) => {
    setSearchQuery("");
    handleSelectCours(c);
  };

  const handleStartRename = () => {
    if (!selectedCours) return;
    setRenamingCoursValue(selectedCours.title);
    setIsRenamingCours(true);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const handleCancelRename = () => {
    setIsRenamingCours(false);
    setRenamingCoursValue("");
  };

  const handleSaveRename = async () => {
    if (!selectedCours || !renamingCoursValue.trim()) return;
    if (renamingCoursValue.trim() === selectedCours.title) {
      handleCancelRename();
      return;
    }
    setIsSavingRename(true);
    const updated = await updateCours(
      selectedCours.id,
      renamingCoursValue.trim(),
      selectedCours.description || null,
      selectedCours.contentText || null
    );
    setIsSavingRename(false);
    if (updated) {
      setSelectedCours(updated);
      toast({ title: "Cours renommé", description: "Le nom du cours a été mis à jour." });
    } else {
      toast({ title: "Erreur", description: "Impossible de renommer le cours.", variant: "destructive" });
    }
    setIsRenamingCours(false);
    setRenamingCoursValue("");
  };

  const handleCardRenameClick = (e: React.MouseEvent, c: SelfLearnerCourse) => {
    e.stopPropagation();
    setRenameCardCoursId(c.id);
    setRenameCardValue(c.title);
    setRenameCardModalOpen(true);
  };

  const handleConfirmCardRename = async () => {
    if (!renameCardCoursId || !renameCardValue.trim()) return;
    const coursToRename = cours.find(c => c.id === renameCardCoursId);
    if (!coursToRename) return;
    if (renameCardValue.trim() === coursToRename.title) {
      setRenameCardModalOpen(false);
      return;
    }
    setIsSavingCardRename(true);
    const updated = await updateCours(
      renameCardCoursId,
      renameCardValue.trim(),
      coursToRename.description || null,
      coursToRename.contentText || null
    );
    setIsSavingCardRename(false);
    if (updated) {
      if (selectedCours?.id === renameCardCoursId) {
        setSelectedCours(updated);
      }
      toast({ title: "Cours renommé", description: "Le nom du cours a été mis à jour." });
      setRenameCardModalOpen(false);
    } else {
      toast({ title: "Erreur", description: "Impossible de renommer le cours.", variant: "destructive" });
    }
  };

  const handleDeleteCours = async (coursId: string) => {
    const success = await deleteCours(coursId);
    if (success) {
      toast({
        title: "Cours supprimé",
        description: "Le cours et toutes ses questions ont été supprimés.",
      });
      if (selectedCours?.id === coursId) {
        setSelectedCours(null);
      }
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le cours.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedCours) return;
    
    setIsGenerating(true);
    const result = await generateQuestions(selectedCours.id, {
      qcm: qcmCount,
      multi: 0,
      ouverte: ouverteCount,
    });

    if (result.success) {
      toast({
        title: "Questions générées",
        description: `${result.questionsCreated} questions ont été créées.`,
      });
      const questions = await fetchQuestions(selectedCours.id);
      setCoursQuestions(questions);
      setQuestionsModified(true);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de générer les questions.",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const handleStartEditQuestion = (q: SelfLearnerQuestion) => {
    setEditingQuestionId(q.id);
    setEditingQuestionText(q.question);
    setEditingAnswerText(q.correctAnswer || "");
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionText("");
    setEditingAnswerText("");
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestionId) return;
    
    const success = await updateQuestion(editingQuestionId, {
      question: editingQuestionText,
      bonne_reponse: editingAnswerText,
    });
    
    if (success) {
      setCoursQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestionId
            ? { ...q, question: editingQuestionText, bonne_reponse: editingAnswerText }
            : q
        )
      );
      setQuestionsModified(true);
      setEditingQuestionId(null);
      setEditingQuestionText("");
      setEditingAnswerText("");
      toast({ title: "Question mise à jour" });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la question.",
        variant: "destructive",
      });
    }
  };

  const handleOpenPdf = async (fichier: SelfLearnerCourseFile) => {
    const url = await getPdfUrl(fichier.fileUrl);
    if (url) {
      setPdfViewerUrl(url);
      setPdfViewerOpen(true);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le PDF.",
        variant: "destructive",
      });
    }
  };

  const handleAddOneQuestion = async (type: 'qcm' | 'ouverte' = 'ouverte') => {
    if (!selectedCours) return;
    
    setIsGenerating(true);
    const result = await addOneQuestion(selectedCours.id, type);

    if (result.success && result.question) {
      toast({ title: "Question ajoutée" });
      setCoursQuestions(prev => [...prev, result.question!]);
      setQuestionsModified(true);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de générer la question.",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const openManualQuestionModal = (type: 'qcm' | 'ouverte') => {
    setManualQuestionType(type);
    setManualQuestionText("");
    setManualQuestionAnswer("");
    setManualQuestionExplication("");
    setManualQcmPropositions(["", "", "", ""]);
    setManualQuestionModalOpen(true);
  };

  const handleCreateManualQuestion = async () => {
    if (!selectedCours) return;
    
    if (!manualQuestionText.trim()) {
      toast({ title: "Erreur", description: "La question est requise.", variant: "destructive" });
      return;
    }
    
    if (!manualQuestionAnswer.trim()) {
      toast({ title: "Erreur", description: "La réponse est requise.", variant: "destructive" });
      return;
    }

    if (manualQuestionType === 'qcm') {
      const validPropositions = manualQcmPropositions.filter(p => p.trim());
      if (validPropositions.length < 2) {
        toast({ title: "Erreur", description: "Un QCM doit avoir au moins 2 propositions.", variant: "destructive" });
        return;
      }
      if (!validPropositions.includes(manualQuestionAnswer.trim())) {
        toast({ title: "Erreur", description: "La bonne réponse doit être une des propositions.", variant: "destructive" });
        return;
      }
    }

    setIsCreatingManualQuestion(true);
    
    const result = await createManualQuestion(selectedCours.id, {
      type: manualQuestionType,
      question: manualQuestionText.trim(),
      propositions: manualQuestionType === 'qcm' ? manualQcmPropositions.filter(p => p.trim()) : undefined,
      bonne_reponse: manualQuestionAnswer.trim(),
      explication: manualQuestionExplication.trim() || undefined,
    });

    if (result.success && result.question) {
      toast({ title: "Question créée" });
      setCoursQuestions(prev => [...prev, result.question!]);
      setQuestionsModified(true);
      setManualQuestionModalOpen(false);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de créer la question.",
        variant: "destructive",
      });
    }
    setIsCreatingManualQuestion(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const success = await deleteQuestion(questionId);
    if (success) {
      setCoursQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setQuestionsModified(true);
      toast({
        title: "Question supprimée",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la question.",
        variant: "destructive",
      });
    }
  };

  const handleValidateQuestions = async () => {
    if (!selectedCours || coursQuestions.length === 0) return;
    
    // Mark questions as validated
    toast({
      title: "Questions validées",
      description: `${coursQuestions.length} questions sont prêtes pour le chatbot.`,
    });
    
    // Close the details modal and open the chatbot modal
    const coursToOpen = selectedCours;
    handleCloseCoursModal();
    setCoursForChatbot(coursToOpen);
    setChatbotModalOpen(true);
  };

  if (authLoading || autoLoading || !user || role !== "self-learner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  const firstName = user.metadata?.firstname || selfLearner?.name || "Apprenant";

  return (
    <SubscriptionBlockModal>
      <div className="min-h-screen bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
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
      <SuggestionsModal open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal} category="self-learner" />

      <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                data-testid="text-self-learner-welcome"
              >
                Edesio Solo
              </h1>
              <p className="text-muted-foreground">
                Créez vos cours, générez des questions et entraînez-vous avec l'IA.
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
                    placeholder="Rechercher un cours..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                    data-testid="input-search-cours"
                  />
                  
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Aucun cours trouvé pour "{searchQuery}"
                        </div>
                      ) : (
                        <div className="py-2">
                          {searchResults.map((c) => (
                            <button
                              key={c.id}
                              className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3"
                              onClick={() => handleSelectSearchResult(c)}
                              data-testid={`search-result-${c.id}`}
                            >
                              <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{c.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {langueLabels[c.language as Language]}
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
                  className="shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500"
                  data-testid="button-open-create-modal"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau cours
                </Button>
              </div>
            </Card>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Mes cours</h2>
                <p className="text-sm text-muted-foreground">{cours.length} cours créé{cours.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {cours.length === 0 ? (
              <Card className="p-10 text-center bg-card/50 backdrop-blur-sm border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aucun cours créé</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Créez votre premier cours pour commencer à générer des questions et vous entraîner avec l'IA.
                </p>
                <Button onClick={handleOpenCreateModal} className="shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500" data-testid="button-create-first-cours">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier cours
                </Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cours.map((c) => (
                  <Card
                    key={c.id}
                    className="p-5 transition-all border-border/50 bg-card/80 backdrop-blur-sm group"
                    data-testid={`card-cours-${c.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{c.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {langueLabels[c.language as Language]}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleCardRenameClick(e, c)}
                          data-testid={`button-rename-cours-${c.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCours(c.id)}
                          data-testid={`button-delete-cours-${c.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSelectCours(c)}
                        data-testid={`button-details-cours-${c.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-amber-500 hover:bg-amber-600"
                        onClick={() => handleReviserCours(c)}
                        data-testid={`button-reviser-cours-${c.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Réviser
                      </Button>
                    </div>
                  </Card>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Créer un nouveau cours
            </DialogTitle>
            <DialogDescription>
              Ajoutez du contenu texte et/ou des fichiers PDF pour générer des questions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="titre"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Titre du cours</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Introduction à la philosophie"
                              {...field}
                              data-testid="input-new-cours-titre"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="langue"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-44">
                          <FormLabel>Langue</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-new-cours-langue">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Langue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.keys(langueLabels) as Language[]).map((lang) => (
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

                  <FormField
                    control={form.control}
                    name="contenu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu du cours (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Collez ici le contenu de votre cours..."
                            className="resize-none min-h-[150px]"
                            {...field}
                            data-testid="textarea-new-cours-contenu"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Fichiers PDF (optionnels)</FormLabel>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf"
                        multiple
                        className="hidden"
                        data-testid="input-pdf-files"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-upload-pdf"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter des PDF
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        PDF uniquement
                      </p>
                    </div>
                    
                    {selectedPdfFiles.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {selectedPdfFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseCreateModal}
                    disabled={isCreating}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating}
                    className="bg-amber-500 hover:bg-amber-600"
                    data-testid="button-submit-create-cours"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer le cours
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCours} onOpenChange={(open) => !open && handleCloseCoursModal()}>
        <DialogContent 
          className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden [&>button]:hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-2xl sm:!w-[95vw] sm:!h-[85vh] sm:!rounded-2xl sm:!border"
        >
          {selectedCours && (
            <>
              <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0 sm:px-6 sm:pt-6 sm:pb-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    {isRenamingCours ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Input
                          ref={renameInputRef}
                          value={renamingCoursValue}
                          onChange={(e) => setRenamingCoursValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                            if (e.key === "Escape") handleCancelRename();
                          }}
                          className="h-8 text-sm"
                          maxLength={200}
                          disabled={isSavingRename}
                          data-testid="input-rename-cours"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={handleSaveRename}
                          disabled={isSavingRename || !renamingCoursValue.trim()}
                          data-testid="button-save-rename"
                        >
                          {isSavingRename ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-emerald-600" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={handleCancelRename}
                          disabled={isSavingRename}
                          data-testid="button-cancel-rename"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 group">
                        <span className="truncate">{selectedCours.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-7 w-7 invisible group-hover:visible"
                          onClick={handleStartRename}
                          data-testid="button-start-rename"
                        >
                          <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCloseCoursModal()}
                    data-testid="button-close-cours-modal"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <DialogDescription>
                  Gérez votre cours et générez des questions
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 min-h-0 overflow-hidden">
                <Tabs value={coursTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                  <TabsList className="w-full justify-start px-6 pt-2 bg-transparent border-b rounded-none">
                    <TabsTrigger value="contenu" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Contenu
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Questions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="contenu" className="flex-1 overflow-y-auto p-6 m-0">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Langue du cours</h4>
                        <Badge variant="outline">
                          {langueLabels[selectedCours.language as Language]}
                        </Badge>
                      </div>
                      
                      {selectedCours.contentText && (
                        <div>
                          <h4 className="font-medium mb-2">Contenu texte</h4>
                          <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {selectedCours.contentText}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Fichiers PDF</h4>
                          <div>
                            <input
                              type="file"
                              ref={existingCoursFileInputRef}
                              onChange={handleAddPdfToExistingCours}
                              accept=".pdf"
                              multiple
                              className="hidden"
                              data-testid="input-add-pdf-existing"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => existingCoursFileInputRef.current?.click()}
                              disabled={isUploadingPdf}
                              data-testid="button-add-pdf-existing"
                            >
                              {isUploadingPdf ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4 mr-1" />
                              )}
                              Ajouter
                            </Button>
                          </div>
                        </div>
                        {loadingFichiers ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : coursFichiers.length === 0 ? (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">Aucun fichier PDF</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => existingCoursFileInputRef.current?.click()}
                              disabled={isUploadingPdf}
                              data-testid="button-add-first-pdf"
                            >
                              {isUploadingPdf ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-1" />
                              )}
                              Ajouter un PDF
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {coursFichiers.map((fichier) => (
                              <div
                                key={fichier.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm">{fichier.fileName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenPdf(fichier)}
                                    data-testid={`button-view-pdf-${fichier.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={async () => {
                                      const success = await deleteCoursFichier(fichier);
                                      if (success) {
                                        setCoursFichiers((prev) => prev.filter((f) => f.id !== fichier.id));
                                        toast({ title: "Fichier supprimé" });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="questions" className="flex-1 flex flex-col overflow-hidden m-0">
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Header with back button */}
                      <div className="flex items-center gap-3 p-4 border-b shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCoursTab("contenu")}
                          data-testid="button-back-to-content"
                        >
                          <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                          Retour au cours
                        </Button>
                        <div className="flex-1" />
                        <Badge variant="outline" className="text-sm">
                          {coursQuestions.length} question{coursQuestions.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      {/* Main scrollable content */}
                      <div className="flex-1 overflow-y-auto p-6">
                        {/* Question generation section - only show if no questions yet */}
                        {coursQuestions.length === 0 && !loadingQuestions && (
                          <Card className="p-5 bg-amber-500/5 border-amber-500/20 mb-6">
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              Générer des questions avec l'IA
                            </h4>
                            
                            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">QCM</p>
                                <p className="text-xs text-muted-foreground">Choix parmi plusieurs réponses</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={qcmCount}
                                  onChange={(e) => setQcmCount(parseInt(e.target.value) || 0)}
                                  className="w-16 h-9 text-center"
                                  data-testid="input-qcm-count"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30 mb-5">
                              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                <PenLine className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">Questions ouvertes</p>
                                <p className="text-xs text-muted-foreground">Réponse libre à rédiger</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={ouverteCount}
                                  onChange={(e) => setOuverteCount(parseInt(e.target.value) || 0)}
                                  className="w-16 h-9 text-center"
                                  data-testid="input-ouverte-count"
                                />
                              </div>
                            </div>

                            <Button
                              onClick={handleGenerateQuestions}
                              disabled={isGenerating || (qcmCount === 0 && ouverteCount === 0)}
                              className="w-full bg-amber-500 hover:bg-amber-600"
                              data-testid="button-generate-questions"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Génération en cours...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Générer {qcmCount + ouverteCount} questions
                                </>
                              )}
                            </Button>
                          </Card>
                        )}

                        {/* Loading state */}
                        {loadingQuestions && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        )}

                        {/* Generating state */}
                        {isGenerating && (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
                            <p className="text-sm text-muted-foreground">Génération des questions en cours...</p>
                          </div>
                        )}

                        {/* Questions list - scrollable */}
                        {!loadingQuestions && !isGenerating && coursQuestions.length > 0 && (
                          <div className="space-y-3">
                            {coursQuestions.map((q, index) => (
                              <Card key={q.id} className="p-4">
                                {editingQuestionId === q.id ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        Question ouverte
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
                                      <Textarea
                                        value={editingQuestionText}
                                        onChange={(e) => setEditingQuestionText(e.target.value)}
                                        className="min-h-[80px] text-sm"
                                        data-testid={`textarea-edit-question-${index}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Réponse attendue</label>
                                      <Textarea
                                        value={editingAnswerText}
                                        onChange={(e) => setEditingAnswerText(e.target.value)}
                                        className="min-h-[60px] text-sm"
                                        data-testid={`textarea-edit-answer-${index}`}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 justify-end">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEditQuestion}
                                        data-testid={`button-cancel-edit-${index}`}
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleSaveQuestion}
                                        className="bg-amber-500 hover:bg-amber-600"
                                        data-testid={`button-save-question-${index}`}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Enregistrer
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${q.type === 'multiple' ? 'border-indigo-500/50 text-indigo-600 dark:text-indigo-400' : ''}`}
                                        >
                                          {q.type === 'multiple' ? 'QCM' : 'Question ouverte'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                      </div>
                                      <p className="text-sm font-medium mb-2">{q.question}</p>
                                      
                                      {/* QCM propositions */}
                                      {q.type === 'multiple' && q.propositions && q.propositions.length > 0 && (
                                        <div className="space-y-1 mb-2">
                                          {q.propositions.map((prop: string, propIndex: number) => (
                                            <div
                                              key={propIndex}
                                              className={`text-xs p-2 rounded flex items-center gap-2 ${
                                                prop === q.correctAnswer
                                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                  : 'bg-muted/50 text-muted-foreground'
                                              }`}
                                            >
                                              {prop === q.correctAnswer && (
                                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                              )}
                                              <span>{prop}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {/* Open question answer */}
                                      {q.type === 'open' && q.correctAnswer && (
                                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                          <span className="font-medium">Réponse attendue : </span>
                                          {q.correctAnswer}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {q.type === 'open' && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleStartEditQuestion(q)}
                                          data-testid={`button-edit-question-${index}`}
                                        >
                                          <Pencil className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        data-testid={`button-delete-question-${index}`}
                                      >
                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            ))}

                            {/* Add question buttons - AI generated */}
                            <div className="space-y-3">
                              <div className="text-xs text-muted-foreground font-medium">Générer avec l'IA</div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 border-dashed"
                                  onClick={() => handleAddOneQuestion('qcm')}
                                  disabled={isGenerating || isCreatingManualQuestion}
                                  data-testid="button-add-one-qcm"
                                >
                                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                  Ajouter un QCM
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 border-dashed"
                                  onClick={() => handleAddOneQuestion('ouverte')}
                                  disabled={isGenerating || isCreatingManualQuestion}
                                  data-testid="button-add-one-ouverte"
                                >
                                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                  Ajouter une question ouverte
                                </Button>
                              </div>

                              {/* Add question buttons - Manual */}
                              <div className="text-xs text-muted-foreground font-medium mt-4">Créer manuellement</div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 border-dashed"
                                  onClick={() => openManualQuestionModal('qcm')}
                                  disabled={isGenerating || isCreatingManualQuestion}
                                  data-testid="button-manual-qcm"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  QCM manuel
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 border-dashed"
                                  onClick={() => openManualQuestionModal('ouverte')}
                                  disabled={isGenerating || isCreatingManualQuestion}
                                  data-testid="button-manual-ouverte"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Question ouverte manuelle
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sticky validate button at bottom - only show if modifications were made */}
                      {questionsModified && coursQuestions.length > 0 && !loadingQuestions && (
                        <div className="shrink-0 border-t bg-background p-4">
                          <Button
                            onClick={handleValidateQuestions}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                            data-testid="button-validate-questions"
                          >
                            <Check className="h-5 w-5 mr-2" />
                            Valider les questions et accéder au chatbot
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {coursForChatbot && (
        <SelfLearnerChatbotModal
          open={chatbotModalOpen}
          onOpenChange={(open: boolean) => {
            setChatbotModalOpen(open);
            if (!open) setCoursForChatbot(null);
          }}
          cours={coursForChatbot}
          generateQuestions={async (coursId: string) => {
            return generateQuestions(coursId, { qcm: qcmCount, multi: 0, ouverte: ouverteCount });
          }}
        />
      )}

      <Dialog open={renameCardModalOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          setRenameCardModalOpen(false);
          setRenameCardCoursId(null);
          setRenameCardValue("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renommer le cours</DialogTitle>
            <DialogDescription>Modifiez le nom de votre cours</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={renameCardValue}
              onChange={(e) => setRenameCardValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCardRename();
              }}
              maxLength={200}
              disabled={isSavingCardRename}
              data-testid="input-rename-card-cours"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRenameCardModalOpen(false)}
                disabled={isSavingCardRename}
                data-testid="button-cancel-card-rename"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmCardRename}
                disabled={isSavingCardRename || !renameCardValue.trim()}
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="button-confirm-card-rename"
              >
                {isSavingCardRename ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Renommer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfViewerOpen} onOpenChange={(open) => {
        setPdfViewerOpen(open);
        if (!open) setPdfViewerUrl(null);
      }}>
        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-4xl sm:!w-[95vw] sm:!h-[90vh] sm:!rounded-2xl sm:!border">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0 sm:px-6" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Document PDF
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setPdfViewerOpen(false);
                  setPdfViewerUrl(null);
                }}
                data-testid="button-close-pdf-viewer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/30">
            {pdfViewerUrl && (
              <iframe
                src={pdfViewerUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Question Creation Modal */}
      <Dialog open={manualQuestionModalOpen} onOpenChange={setManualQuestionModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {manualQuestionType === 'qcm' ? 'Créer un QCM' : 'Créer une question ouverte'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={manualQuestionText}
                onChange={(e) => setManualQuestionText(e.target.value)}
                placeholder="Entrez votre question..."
                className="min-h-[80px]"
                data-testid="input-manual-question"
              />
            </div>

            {manualQuestionType === 'qcm' && (
              <div className="space-y-2">
                <Label>Propositions (4 max)</Label>
                {manualQcmPropositions.map((prop: string, index: number) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                    <Input
                      value={prop}
                      onChange={(e) => {
                        const newProps = [...manualQcmPropositions];
                        newProps[index] = e.target.value;
                        setManualQcmPropositions(newProps);
                      }}
                      placeholder={`Proposition ${String.fromCharCode(65 + index)}`}
                      data-testid={`input-proposition-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>{manualQuestionType === 'qcm' ? 'Bonne réponse (texte exact d\'une proposition)' : 'Réponse attendue'}</Label>
              {manualQuestionType === 'qcm' ? (
                <Select value={manualQuestionAnswer} onValueChange={setManualQuestionAnswer}>
                  <SelectTrigger data-testid="select-correct-answer">
                    <SelectValue placeholder="Sélectionner la bonne réponse" />
                  </SelectTrigger>
                  <SelectContent>
                    {manualQcmPropositions.filter((p: string) => p.trim()).map((prop: string, index: number) => (
                      <SelectItem key={index} value={prop}>
                        {String.fromCharCode(65 + index)}. {prop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  value={manualQuestionAnswer}
                  onChange={(e) => setManualQuestionAnswer(e.target.value)}
                  placeholder="Entrez la réponse attendue..."
                  className="min-h-[60px]"
                  data-testid="input-manual-answer"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Explication (optionnel)</Label>
              <Textarea
                value={manualQuestionExplication}
                onChange={(e) => setManualQuestionExplication(e.target.value)}
                placeholder="Explication qui sera affichée après la réponse..."
                className="min-h-[60px]"
                data-testid="input-manual-explication"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualQuestionModalOpen(false)} disabled={isCreatingManualQuestion}>
              Annuler
            </Button>
            <Button onClick={handleCreateManualQuestion} disabled={isCreatingManualQuestion} data-testid="button-create-manual-question">
              {isCreatingManualQuestion ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Créer la question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </SubscriptionBlockModal>
  );
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  type?: "greeting" | "question" | "answer" | "feedback" | "completion" | "no_questions";
  isCorrect?: boolean;
  isPartial?: boolean;
  scoreRatio?: number;
}

interface ShuffledQuestion extends SelfLearnerQuestion {
  shuffledPropositions?: string[];
  shuffleMap?: number[];
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const correctFeedbackMessages = [
  "Bravo ! C'est la bonne réponse !",
  "Excellent ! Tu as tout compris !",
  "Super ! Continue comme ça !",
  "Parfait ! Tu es sur la bonne voie !",
  "Génial ! Tu maîtrises bien le sujet !",
  "Bien joué ! C'est exact !",
  "Formidable ! Tu progresses !",
];

const incorrectFeedbackMessages = [
  "Pas tout à fait...",
  "Ce n'est pas ça...",
  "Hmm, pas exactement...",
  "Presque ! Mais ce n'est pas la bonne réponse.",
  "Pas cette fois...",
];

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function TypingIndicatorAutonome() {
  return (
    <div className="flex gap-3" data-testid="typing-indicator">
      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-amber-500/20 shadow-md">
        <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
        <AvatarFallback className="bg-amber-500/10 text-amber-500">IA</AvatarFallback>
      </Avatar>
      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubbleAutonome({ message }: { message: ChatMessage }) {
  const isBot = message.sender === "bot";

  return (
    <div
      className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      data-testid={`message-${message.id}`}
    >
      <Avatar
        className={`h-10 w-10 flex-shrink-0 shadow-md ${
          isBot 
            ? "ring-2 ring-amber-500/20" 
            : "ring-2 ring-amber-500/30"
        }`}
      >
        {isBot ? (
          <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
        ) : null}
        <AvatarFallback className={isBot ? "bg-amber-500/10 text-amber-500 text-sm font-semibold" : "bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-sm"}>
          {isBot ? "IA" : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[85%] shadow-sm ${
          isBot 
            ? "bg-card border border-border text-foreground rounded-2xl rounded-tl-md" 
            : "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl rounded-tr-md"
        } ${
          message.type === "feedback" && message.isCorrect === true
            ? "!border-2 !border-emerald-400/60 !bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/40"
            : ""
        } ${
          message.type === "feedback" && message.isCorrect === false && message.isPartial
            ? "!border-2 !border-orange-400/60 !bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40"
            : ""
        } ${
          message.type === "feedback" && message.isCorrect === false && !message.isPartial
            ? "!border-2 !border-red-400/60 !bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40"
            : ""
        } ${
          message.type === "completion" && message.scoreRatio !== undefined && message.scoreRatio >= 0.7
            ? "!border-2 !border-emerald-400/60 !bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/40"
            : ""
        } ${
          message.type === "completion" && message.scoreRatio !== undefined && message.scoreRatio >= 0.5 && message.scoreRatio < 0.7
            ? "!border-2 !border-orange-400/60 !bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40"
            : ""
        } ${
          message.type === "completion" && (message.scoreRatio === undefined || message.scoreRatio < 0.5)
            ? "!border-2 !border-red-400/60 !bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40"
            : ""
        } px-4 py-3`}
      >
        {message.type === "completion" && (
          <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
            message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
              ? "border-emerald-300/30" 
              : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                ? "border-orange-300/30" 
                : "border-red-300/30"
          }`}>
            <div className={`p-1.5 rounded-full ${
              message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
                ? "bg-emerald-500/20" 
                : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                  ? "bg-orange-500/20" 
                  : "bg-red-500/20"
            }`}>
              <Trophy className={`h-4 w-4 ${
                message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                    ? "text-orange-600 dark:text-orange-400" 
                    : "text-red-600 dark:text-red-400"
              }`} />
            </div>
            <span className={`font-bold text-sm ${
              message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
                ? "text-emerald-700 dark:text-emerald-300" 
                : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                  ? "text-orange-700 dark:text-orange-300" 
                  : "text-red-700 dark:text-red-300"
            }`}>Session terminée !</span>
          </div>
        )}
        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
        {message.type === "feedback" && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-current/10">
            {message.isCorrect ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <div className="p-1 rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Bonne réponse ! +1 point</span>
              </div>
            ) : message.isPartial ? (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <div className="p-1 rounded-full bg-orange-500/20">
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Réponse partielle +0.5 point</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="p-1 rounded-full bg-red-500/20">
                  <XCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">À revoir</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QCMOptionsAutonome({
  propositions,
  onSelect,
  disabled,
}: {
  propositions: string[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-4 animate-in fade-in slide-in-from-bottom-3 duration-300" data-testid="qcm-options-container">
      <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        <span>Clique sur ta réponse</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-2">
        {propositions.map((prop, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            disabled={disabled}
            className={`group relative flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 font-medium text-left transition-all duration-200 shadow-sm ${!disabled ? 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300 dark:hover:border-amber-600 active:scale-[0.98]' : 'opacity-60'} min-h-[68px]`}
            data-testid={`button-qcm-option-${i}`}
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-md bg-white dark:bg-amber-800/50 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-sm font-bold mt-0.5">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-sm leading-snug flex-1">{prop}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiOptionsAutonome({
  propositions,
  selectedIndices,
  onToggle,
  onValidate,
  disabled,
}: {
  propositions: string[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
  onValidate: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-4 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300" data-testid="multi-options-container">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 text-amber-500" />
        <span>Sélectionne toutes les bonnes réponses</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-2">
        {propositions.map((prop, i) => {
          const isSelected = selectedIndices.includes(i);
          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              disabled={disabled}
              className={`group flex items-start gap-3 p-4 rounded-xl font-medium text-sm transition-all duration-200 min-h-[68px] ${
                isSelected 
                  ? 'bg-amber-500 border-2 border-amber-600 text-white shadow-md' 
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 shadow-sm'
              } ${!disabled ? (isSelected ? 'hover:bg-amber-600' : 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300 dark:hover:border-amber-600') + ' active:scale-[0.98]' : 'opacity-60'}`}
              data-testid={`button-multi-option-${i}`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold mt-0.5 ${
                isSelected ? 'bg-white/20 border border-white/30' : 'bg-white dark:bg-amber-800/50 border border-amber-200 dark:border-amber-700'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-left leading-snug">{prop}</span>
              {isSelected && <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center pt-2">
        <Button
          onClick={onValidate}
          disabled={selectedIndices.length === 0 || disabled}
          className="px-8 h-11 rounded-xl bg-amber-500 hover:bg-amber-600"
          data-testid="button-validate-multi"
        >
          <Check className="h-4 w-4 mr-2" />
          Valider ({selectedIndices.length} sélectionnée{selectedIndices.length > 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
}

function ChatbotPanel({ coursId, coursLangue }: { coursId: string; coursLangue: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatState, setChatState] = useState<"idle" | "loading" | "greeting" | "asking" | "completed">("idle");
  const [selectedMultiIndices, setSelectedMultiIndices] = useState<number[]>([]);
  const [waitingForAcknowledge, setWaitingForAcknowledge] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<"correct" | "partial" | "wrong" | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [waitingForRetry, setWaitingForRetry] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: generateId() }]);
  };

  const loadAndStartQuiz = async () => {
    setChatState("loading");
    setMessages([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setSelectedMultiIndices([]);
    setWaitingForAcknowledge(false);
    setLastAnswerResult(null);
    setIsRetryAttempt(false);
    setWaitingForRetry(false);

    const { data } = await supabase
      .from("autodidacte_questions")
      .select("*")
      .eq("cours_id", coursId)
      .order("created_at", { ascending: true });

    const questions = data || [];
    
    if (questions.length === 0) {
      setChatState("greeting");
      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: "Bonjour ! Je suis Edesio. Malheureusement, il n'y a pas encore de questions pour ce cours.",
          type: "greeting",
        });
        setTimeout(() => {
          addMessage({
            sender: "bot",
            text: "Génère d'abord des questions dans l'onglet Questions pour pouvoir t'entraîner !",
            type: "no_questions",
          });
          setChatState("completed");
        }, 1500);
      }, 500);
      return;
    }

    const shuffled = shuffleArray(questions);
    const processedQuestions = shuffled.map(q => {
      if ((q.type === "qcm" || q.type === "multi") && q.propositions && q.propositions.length > 0) {
        const indices: number[] = q.propositions.map((_: string, i: number) => i);
        const shuffledIndices = shuffleArray<number>(indices);
        const shuffledPropositions = shuffledIndices.map((i) => q.propositions![i]);
        return {
          ...q,
          shuffledPropositions,
          shuffleMap: shuffledIndices,
        } as ShuffledQuestion;
      }
      return q as ShuffledQuestion;
    });

    setShuffledQuestions(processedQuestions);
    setChatState("greeting");

    setTimeout(() => {
      addMessage({
        sender: "bot",
        text: `Bonjour ! Je suis Edesio, je vais t'aider à réviser ce cours.`,
        type: "greeting",
      });

      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: `J'ai ${processedQuestions.length} questions pour toi. Prêt(e) à réviser ?`,
          type: "greeting",
        });
        setTimeout(() => {
          askQuestion(0, processedQuestions);
        }, 1000);
      }, 1500);
    }, 500);
  };

  const askQuestion = (index: number, questions: ShuffledQuestion[]) => {
    if (index >= questions.length) {
      setChatState("completed");
      return;
    }

    const question = questions[index];
    let questionText = `Question ${index + 1}/${questions.length}\n\n${question.question}`;

    if (question.type === "multiple") {
      questionText += "\n\n(Plusieurs réponses possibles)";
    }

    addMessage({
      sender: "bot",
      text: questionText,
      type: "question",
    });
    setSelectedMultiIndices([]);
    setChatState("asking");
  };

  const showCompletion = async (finalScore: number, finalTotal: number) => {
    const ratio = finalTotal > 0 ? finalScore / finalTotal : 0;
    const scoreDisplay = finalScore % 1 === 0 ? finalScore : finalScore.toFixed(1);
    
    let feedbackText = "Bravo pour avoir terminé cette révision !";
    if (ratio >= 0.8) {
      feedbackText = "Excellent travail ! Tu maîtrises très bien ce sujet.";
    } else if (ratio >= 0.6) {
      feedbackText = "Bon travail ! Continue à réviser pour progresser encore.";
    } else if (ratio >= 0.4) {
      feedbackText = "Tu as fait des efforts ! N'hésite pas à revoir les notions difficiles.";
    } else {
      feedbackText = "Continue à t'entraîner, tu vas progresser !";
    }

    addMessage({
      sender: "bot",
      text: `Tu as terminé la révision !\n\nTon score : ${scoreDisplay}/${finalTotal} points.\n\n${feedbackText}`,
      type: "completion",
      scoreRatio: ratio,
    });
    
    setChatState("completed");
  };

  useEffect(() => {
    if (chatState === "idle") {
      loadAndStartQuiz();
    }
  }, [coursId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleQCMAnswer = (selectedIndex: number) => {
    if (isProcessing || chatState !== "asking") return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;

    setIsProcessing(true);
    const propositions = question.shuffledPropositions || question.propositions;
    const selectedOption = propositions?.[selectedIndex] || "";
    
    addMessage({
      sender: "user",
      text: `${String.fromCharCode(65 + selectedIndex)}. ${selectedOption}`,
      type: "answer",
    });

    const isCorrect = selectedOption === question.correctAnswer;
    processAnswer(isCorrect, question.correctAnswer || "", question.explication);
  };

  const handleMultiAnswer = () => {
    if (isProcessing || chatState !== "asking" || selectedMultiIndices.length === 0) return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;

    setIsProcessing(true);
    const propositions = question.shuffledPropositions || question.propositions;
    const selectedOptions = selectedMultiIndices
      .sort((a, b) => a - b)
      .map(i => propositions?.[i] || "");
    
    const answerText = selectedMultiIndices
      .sort((a, b) => a - b)
      .map(i => `${String.fromCharCode(65 + i)}. ${propositions?.[i]}`)
      .join(", ");
    
    addMessage({
      sender: "user",
      text: answerText,
      type: "answer",
    });

    const correctAnswers = question.correctAnswers || [];
    
    // Normalize strings for case-insensitive comparison
    const normalize = (s: string) => s.toLowerCase().trim();
    const selectedNormalized = selectedOptions.map(normalize).sort();
    const correctNormalized = correctAnswers.map(normalize).sort();
    
    const isCorrect = 
      selectedNormalized.length === correctNormalized.length &&
      selectedNormalized.every((opt, i) => opt === correctNormalized[i]);

    const correctDisplay = correctAnswers.join(", ");
    processAnswer(isCorrect, correctDisplay, question.explication);
  };

  const handleOpenAnswer = async (answer: string) => {
    if (isProcessing || waitingForAcknowledge) return;
    if (chatState !== "asking" && !waitingForRetry) return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;

    setIsProcessing(true);
    setShowTyping(true);
    
    addMessage({
      sender: "user",
      text: answer,
      type: "answer",
    });

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          correctAnswer: question.correctAnswer || "",
          studentAnswer: answer,
          explication: question.explication || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'évaluation");
      }

      const evaluation = await response.json();
      processOpenAnswer(evaluation.score, evaluation.feedback, question.correctAnswer || "", evaluation.missingElements);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setShowTyping(false);
      const isCorrect = answer.toLowerCase().includes((question.correctAnswer || "").toLowerCase().substring(0, 10));
      processAnswer(isCorrect, question.correctAnswer || "", question.explication);
    }
  };

  const processOpenAnswer = (
    scorePoints: number, 
    feedback: string, 
    correctAnswer: string,
    missingElements?: string[]
  ) => {
    setShowTyping(false);
    setWaitingForRetry(false);

    const isFullyCorrect = scorePoints === 1;
    const isPartiallyCorrect = scorePoints === 0.5;
    const shouldCountQuestion = isFullyCorrect || isPartiallyCorrect || isRetryAttempt;
    
    if (shouldCountQuestion) {
      setScore((prev) => prev + scorePoints);
      setTotalAnswered((prev) => prev + 1);
    }

    setTimeout(() => {
      if (isFullyCorrect) {
        const successMessage = isRetryAttempt 
          ? "Bravo ! C'est la bonne réponse ! Continue comme ça."
          : feedback;
        
        addMessage({
          sender: "bot",
          text: successMessage,
          type: "feedback",
          isCorrect: true,
        });

        setIsRetryAttempt(false);
        setLastAnswerResult("correct");
        setWaitingForAcknowledge(true);
        setIsProcessing(false);
      } else if (isPartiallyCorrect) {
        const missingInfo = missingElements && missingElements.length > 0 
          ? `\n\nÉléments manquants : ${missingElements.join(", ")}`
          : "";
        addMessage({
          sender: "bot",
          text: `${feedback}${missingInfo}\n\nRéponse complète : ${correctAnswer}`,
          type: "feedback",
          isCorrect: false,
          isPartial: true,
        });

        setIsRetryAttempt(false);
        setLastAnswerResult("partial");
        setWaitingForAcknowledge(true);
        setIsProcessing(false);
      } else {
        if (!isRetryAttempt) {
          addMessage({
            sender: "bot",
            text: `${feedback}\n\nRéponse attendue : ${correctAnswer}\n\nQu'est-ce qui te semble être l'élément clé de cette réponse ?`,
            type: "feedback",
            isCorrect: false,
          });
          setIsRetryAttempt(true);
          setWaitingForRetry(true);
          setIsProcessing(false);
        } else {
          addMessage({
            sender: "bot",
            text: `${feedback}\n\nPas de souci, tu pourras revoir cette notion plus tard. Passons à la suite !`,
            type: "feedback",
            isCorrect: false,
          });
          setIsRetryAttempt(false);
          setLastAnswerResult("wrong");
          setWaitingForAcknowledge(true);
          setIsProcessing(false);
        }
      }
    }, 500);
  };

  const processAnswer = (isCorrect: boolean, correctAnswer: string, explication?: string | null) => {
    setScore((prev) => prev + (isCorrect ? 1 : 0));
    setTotalAnswered((prev) => prev + 1);

    setTimeout(() => {
      if (isCorrect) {
        addMessage({
          sender: "bot",
          text: `${getRandomMessage(correctFeedbackMessages)}${explication ? `\n\n${explication}` : ""}`,
          type: "feedback",
          isCorrect: true,
        });
        setLastAnswerResult("correct");
      } else {
        addMessage({
          sender: "bot",
          text: `${getRandomMessage(incorrectFeedbackMessages)} La bonne réponse était : ${correctAnswer}${explication ? `\n\n${explication}` : ""}`,
          type: "feedback",
          isCorrect: false,
        });
        setLastAnswerResult("wrong");
      }
      setWaitingForAcknowledge(true);
      setIsProcessing(false);
    }, 500);
  };

  const handleAcknowledge = async () => {
    setWaitingForAcknowledge(false);
    setLastAnswerResult(null);
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    if (nextIndex >= shuffledQuestions.length) {
      await showCompletion(score, totalAnswered);
    } else {
      askQuestion(nextIndex, shuffledQuestions);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;
    handleOpenAnswer(inputValue.trim());
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setInputValue("");
    setIsProcessing(false);
    setSelectedMultiIndices([]);
    setWaitingForAcknowledge(false);
    setLastAnswerResult(null);
    setShowTyping(false);
    setIsRetryAttempt(false);
    setWaitingForRetry(false);
    setShuffledQuestions([]);
    setChatState("idle");
  };

  const toggleMultiOption = (index: number) => {
    setSelectedMultiIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const currentPropositions = currentQuestion?.shuffledPropositions || currentQuestion?.propositions;
  
  const showQCMOptions =
    chatState === "asking" &&
    currentQuestion?.type === "multiple" &&
    !isProcessing &&
    messages[messages.length - 1]?.type === "question";
  
  const showMultiOptions =
    chatState === "asking" &&
    currentQuestion?.type === "multiple" &&
    !isProcessing &&
    messages[messages.length - 1]?.type === "question";
  
  const showTextInput =
    ((chatState === "asking" &&
    currentQuestion?.type === "open" &&
    !isProcessing) || waitingForRetry) && !waitingForAcknowledge;

  const progressPercent = shuffledQuestions.length > 0 ? Math.min((totalAnswered / shuffledQuestions.length) * 100, 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25">
              <img 
                src="/edesio-logo-square.png" 
                alt="Edesio" 
                className="w-full h-full rounded-[10px] object-cover bg-white dark:bg-background" 
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center shadow-sm">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-sm">Edesio</span>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Quiz en cours
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {shuffledQuestions.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2.5 py-1 font-semibold">
              {score % 1 === 0 ? score : score.toFixed(1)}/{totalAnswered}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="rounded-xl hover:bg-amber-500/10"
            data-testid="button-reset-quiz"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {shuffledQuestions.length > 0 && totalAnswered > 0 && (
        <div className="px-4 py-2.5 border-b bg-muted/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Progression</span>
            <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20"
        data-testid="chatbot-messages"
      >
        {chatState === "loading" ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
            <p className="text-sm">Chargement des questions...</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubbleAutonome key={message.id} message={message} />
          ))
        )}
        {(isProcessing || showTyping) && <TypingIndicatorAutonome />}
      </div>

      {showQCMOptions && currentPropositions && (
        <div className="flex-shrink-0 max-h-[45vh] overflow-y-auto px-2 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <QCMOptionsAutonome
            propositions={currentPropositions}
            onSelect={handleQCMAnswer}
            disabled={isProcessing}
          />
        </div>
      )}

      {showMultiOptions && currentPropositions && (
        <div className="flex-shrink-0 max-h-[50vh] overflow-y-auto px-2 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <MultiOptionsAutonome
            propositions={currentPropositions}
            selectedIndices={selectedMultiIndices}
            onToggle={toggleMultiOption}
            onValidate={handleMultiAnswer}
            disabled={isProcessing}
          />
        </div>
      )}

      {waitingForAcknowledge && (
        <div 
          className={`flex-shrink-0 px-4 py-4 border-t backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            lastAnswerResult === "correct" 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" 
              : lastAnswerResult === "partial"
              ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
              : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
          }`}
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex justify-center">
            <Button
              onClick={handleAcknowledge}
              className={`w-full max-w-xs h-12 rounded-xl font-semibold shadow-md ${
                lastAnswerResult === "correct"
                  ? "bg-[#16A34A] hover:bg-[#15803D] text-white"
                  : lastAnswerResult === "partial"
                  ? "bg-[#F59E0B] hover:bg-[#D97706] text-white"
                  : "bg-[#3B82F6] hover:bg-[#2563EB] text-white"
              }`}
              data-testid="button-acknowledge"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Question suivante
            </Button>
          </div>
        </div>
      )}

      {showTextInput && (
        <div className="flex-shrink-0 px-4 py-4 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tape ta réponse ici..."
                className="min-h-[48px] max-h-[120px] py-3 px-4 rounded-xl bg-background/80 border-border/50 focus-visible:ring-amber-500/30 text-base resize-none overflow-y-auto"
                data-testid="input-open-answer"
                disabled={isProcessing}
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              size="icon"
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 shadow-lg shadow-amber-500/25 flex-shrink-0"
              data-testid="button-send-open-answer"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">Appuie sur Entrée pour envoyer</p>
        </div>
      )}

      {chatState === "completed" && messages.length > 0 && (
        <div className="flex-shrink-0 px-4 py-4 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-center">
            <Button
              className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 shadow-lg shadow-amber-500/25 px-8 !ring-0 !ring-offset-0 focus:outline-none border border-amber-600"
              onClick={handleReset}
              data-testid="button-restart-quiz"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recommencer le quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
