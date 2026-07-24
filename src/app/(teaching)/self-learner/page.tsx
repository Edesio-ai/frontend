"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslations } from "@/lib/i18n/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSelfLearner } from "@/hooks/use-self-learner";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { useToast } from "@/hooks/use-toast";
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
  PenLine,
  Check,
  CheckCircle2,
  Pencil,
  Lightbulb,
} from "lucide-react";

import { SelfLearnerChatbotModal } from "@/components/self-learner/self-learner-chatbot-modal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Language, QuestionType, SelfLearnerCourse, SelfLearnerCourseFile, SelfLearnerQuestion } from "@/types";
import { useAuth } from "@/contexts/auth-context";

type CreateCoursFormValues = {
  titre: string;
  contenu?: string;
  langue: "francais" | "anglais" | "espagnol" | "allemand";
};

export default function SelfLearner() {
  const { user, loading: authLoading, logout, getUserRole } = useAuth();
  const t = useTranslations();
  const createCoursFormSchema = useMemo(
    () =>
      z.object({
        titre: z.string().min(1, t.zod.courseTitleRequired).max(200, t.zod.courseTitleRequired),
        contenu: z.string().optional().or(z.literal("")),
        langue: z.enum(["francais", "anglais", "espagnol", "allemand"]),
      }),
    [t],
  );
  const langueLabels: Record<Language, string> = {
    francais: t.selfLearner.langueLabels.francais,
    anglais: t.selfLearner.langueLabels.anglais,
    espagnol: t.selfLearner.langueLabels.espagnol,
    allemand: t.selfLearner.langueLabels.allemand,
  };
  const {
    selfLearner,
    cours,
    loading: autoLoading,
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

  const [courseTab, setCourseTab] = useState<"content" | "questions">("content");
  const [coursFichiers, setCourseFiles] = useState<SelfLearnerCourseFile[]>([]);
  const [coursQuestions, setCoursQuestions] = useState<SelfLearnerQuestion[]>([]);
  const [loadingFichiers, setLoadingFichiers] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qcmCount, setQcmCount] = useState(5);
  const [ouverteCount, setOuverteCount] = useState(5);

  const [chatbotModalOpen, setChatbotModalOpen] = useState(false);
  const [courseForChatbot, setCourseForChatbot] = useState<SelfLearnerCourse | null>(null);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingAnswerText, setEditingAnswerText] = useState("");
  const [questionsModified, setQuestionsModified] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  const [manualQuestionModalOpen, setManualQuestionModalOpen] = useState(false);
  const [manualQuestionType, setManualQuestionType] = useState<"single" | "open">("open");
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
  const [renameCardCourseId, setRenameCardCourseId] = useState<string | null>(null);
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
      const filtered = cours.filter((c) => c.title.toLowerCase().includes(query));
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
    router.push("/login");
  };

  const handleSelectCours = async (c: SelfLearnerCourse) => {
    setSelectedCours(c);
    setCourseTab("content");
    setCourseFiles([]);
    setCoursQuestions([]);

    setLoadingFichiers(true);
    const files = await fetchSelfLearnerCourseFiles(c.id);
    setCourseFiles(files);
    setLoadingFichiers(false);
  };

  // For new course creation - go directly to questions tab
  const handleSelectCoursForQuestions = async (c: SelfLearnerCourse) => {
    setSelectedCours(c);
    setCourseTab("questions");
    setCourseFiles([]);
    setCoursQuestions([]);

    setLoadingFichiers(true);
    const files = await fetchSelfLearnerCourseFiles(c.id);
    setCourseFiles(files);
    setLoadingFichiers(false);
  };

  // Open dedicated chatbot modal for revision
  const handleCourseReview = (c: SelfLearnerCourse) => {
    setCourseForChatbot(c);
    setChatbotModalOpen(true);
  };

  const handleCloseCoursModal = () => {
    setSelectedCours(null);
    setCourseTab("content");
    setCourseFiles([]);
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
    const tab = value as "content" | "questions";
    setCourseTab(tab);

    if (tab === "questions" && selectedCours && coursQuestions.length === 0) {
      setLoadingQuestions(true);
      const questions = await fetchSelfLearnerQuestions(selectedCours.id);
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
          setCourseFiles((prev) => [...prev, result]);
        }
      }
      toast({
        title: t.selfLearner.toasts.uploadSuccess,
      });
    } catch (err) {
      console.error("Error uploading PDF:", err);
      toast({
        title: t.selfLearner.toasts.error,
        description: t.selfLearner.toasts.uploadError,
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
        selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined,
      );

      handleCloseCreateModal();

      if (!newCours) {
        toast({
          title: t.selfLearner.toasts.error,
          description: t.selfLearner.toasts.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.selfLearner.toasts.courseCreated,
        });
        // Open course and go directly to questions tab for generation
        await handleSelectCoursForQuestions(newCours);
      }
    } catch (err) {
      console.error("Error in creation flow:", err);
      toast({
        title: t.selfLearner.toasts.error,
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
    const updated = await updateSelfLearnerCourse(
      selectedCours.id,
      renamingCoursValue.trim(),
      selectedCours.description || null,
      selectedCours.contentText || null,
    );
    setIsSavingRename(false);
    if (updated) {
      setSelectedCours(updated);
      toast({ title: t.selfLearner.toasts.courseUpdated });
    } else {
      toast({ title: t.selfLearner.toasts.error, variant: "destructive" });
    }
    setIsRenamingCours(false);
    setRenamingCoursValue("");
  };

  const handleCardRenameClick = (e: React.MouseEvent, c: SelfLearnerCourse) => {
    e.stopPropagation();
    setRenameCardCourseId(c.id);
    setRenameCardValue(c.title);
    setRenameCardModalOpen(true);
  };

  const handleConfirmCardRename = async () => {
    if (!renameCardCourseId || !renameCardValue.trim()) return;
    const coursToRename = cours.find((c) => c.id === renameCardCourseId);
    if (!coursToRename) return;
    if (renameCardValue.trim() === coursToRename.title) {
      setRenameCardModalOpen(false);
      return;
    }
    setIsSavingCardRename(true);
    const updated = await updateSelfLearnerCourse(
      renameCardCourseId,
      renameCardValue.trim(),
      coursToRename.description || null,
      coursToRename.contentText || null,
    );
    setIsSavingCardRename(false);
    if (updated) {
      if (selectedCours?.id === renameCardCourseId) {
        setSelectedCours(updated);
      }
      toast({ title: t.selfLearner.toasts.courseUpdated });
      setRenameCardModalOpen(false);
    } else {
      toast({ title: t.selfLearner.toasts.error, variant: "destructive" });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const success = await deleteSelfLearnerCourse(courseId);
    if (success) {
      toast({
        title: t.selfLearner.toasts.courseDeleted,
      });
      if (selectedCours?.id === courseId) {
        setSelectedCours(null);
      }
    } else {
      toast({
        title: t.selfLearner.toasts.error,
        variant: "destructive",
      });
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedCours) return;

    setIsGenerating(true);
    const result = await generateQuestions(selectedCours.id, {
      simpleCount: qcmCount,
      openedCount: ouverteCount,
      totalQuestions: qcmCount + ouverteCount,
    });

    if (result.success) {
      toast({
        title: t.selfLearner.toasts.questionsGenerated,
      });
      const questions = await fetchSelfLearnerQuestions(selectedCours.id);
      setCoursQuestions(questions);
      setQuestionsModified(true);
    } else {
      toast({
        title: t.selfLearner.toasts.error,
        description: result.error || t.selfLearner.toasts.questionGenError,
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const handleStartEditQuestion = (q: SelfLearnerQuestion) => {
    setEditingQuestionId(q.id);
    setEditingQuestionText(q.questionText);
    setEditingAnswerText(q.correctAnswers?.[0] || "");
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionText("");
    setEditingAnswerText("");
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestionId) return;

    try {
      await updateSelfLearnerQuestion(editingQuestionId, {
        questionText: editingQuestionText,
        correctAnswers: [editingAnswerText],
      });

      setCoursQuestions((prev) => {
        return prev.map((q) =>
          q.id === editingQuestionId
            ? { ...q, questionText: editingQuestionText, correctAnswers: [editingAnswerText] }
            : q,
        );
      });
      setQuestionsModified(true);
      setEditingQuestionId(null);
      setEditingQuestionText("");
      setEditingAnswerText("");
      toast({ title: t.selfLearner.toasts.courseUpdated });
    } catch {
      toast({
        title: t.selfLearner.toasts.error,
        variant: "destructive",
      });
    }
  };

  const handleOpenPdf = async (fichier: SelfLearnerCourseFile) => {
    const url = await getPdfUrl(fichier.id);

    if (url) {
      setPdfViewerUrl(url);
      setPdfViewerOpen(true);
    } else {
      toast({
        title: t.selfLearner.toasts.error,
        variant: "destructive",
      });
    }
  };

  const handleGenerateSelfLearnerQuestion = async (type: Omit<QuestionType, "multiple"> = "open") => {
    if (!selectedCours) return;

    setIsGenerating(true);
    const result = await generateSelfLearnerQuestion(selectedCours.id, type);

    if (result.success && result.question) {
      toast({ title: t.selfLearner.toasts.questionsGenerated });
      setCoursQuestions((prev) => [...prev, result.question!]);
      setQuestionsModified(true);
    } else {
      toast({
        title: t.selfLearner.toasts.error,
        description: result.error || t.selfLearner.toasts.questionGenError,
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const openManualQuestionModal = (type: "single" | "open") => {
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
      toast({ title: t.selfLearner.toasts.error, variant: "destructive" });
      return;
    }

    if (!manualQuestionAnswer.trim()) {
      toast({ title: t.selfLearner.toasts.error, variant: "destructive" });
      return;
    }

    if (manualQuestionType === "single") {
      const validPropositions = manualQcmPropositions.filter((p) => p.trim());
      if (validPropositions.length < 2) {
        toast({ title: t.selfLearner.toasts.error, variant: "destructive" });
        return;
      }
      if (!validPropositions.includes(manualQuestionAnswer.trim())) {
        toast({ title: t.selfLearner.toasts.error, variant: "destructive" });
        return;
      }
    }

    setIsCreatingManualQuestion(true);

    const result = await createManualQuestion(selectedCours.id, {
      type: manualQuestionType as "single" | "open",
      questionText: manualQuestionText.trim(),
      proposals: manualQuestionType === "single" ? manualQcmPropositions.filter((p) => p.trim()) : [],
      correctAnswers: [manualQuestionAnswer.trim()],
      explanation: manualQuestionExplication.trim() || undefined,
    });

    if (result.success && result.question) {
      toast({ title: t.selfLearner.toasts.questionsGenerated });
      setCoursQuestions((prev) => [...prev, result.question!]);
      setQuestionsModified(true);
      setManualQuestionModalOpen(false);
    } else {
      toast({
        title: t.selfLearner.toasts.error,
        description: result.error || t.selfLearner.toasts.questionGenError,
        variant: "destructive",
      });
    }
    setIsCreatingManualQuestion(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const success = await deleteSelfLearnerQuestion(questionId);
    if (success) {
      setCoursQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setQuestionsModified(true);
      toast({
        title: t.selfLearner.toasts.courseDeleted,
      });
    } else {
      toast({
        title: t.selfLearner.toasts.error,
        variant: "destructive",
      });
    }
  };

  const handleValidateQuestions = async () => {
    if (!selectedCours || coursQuestions.length === 0) return;

    // Mark questions as validated
    toast({
      title: t.selfLearner.toasts.questionsValidated,
    });

    // Close the details modal and open the chatbot modal
    const coursToOpen = selectedCours;
    handleCloseCoursModal();
    setCourseForChatbot(coursToOpen);
    setChatbotModalOpen(true);
  };

  if (authLoading || autoLoading || !user || role !== "self-learner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.selfLearner.loading}</p>
        </div>
      </div>
    );
  }

  const firstName = user.metadata?.firstname || selfLearner?.name || t.dashboard.questionsPanel.studentFallback;

  return (
    <SubscriptionBlockModal>
      <div className="min-h-screen bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20 gap-3 sm:gap-6">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold shrink-0">
                <img src="/edesio-logo-square.png" alt="Edesio" className="w-10 h-10 rounded-lg object-cover" />
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Edesio
                </span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestionsModal(true)}
                  className="border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400"
                  data-testid="button-suggestions"
                >
                  <Lightbulb className="h-4 w-4 mr-1.5" />
                  {t.nav.suggestions}
                </Button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{firstName}</span>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" data-testid="button-profile">
                    <UserCog className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.nav.profile}</span>
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
                      <span className="hidden sm:inline">{t.nav.logout}</span>
                    </>
                  )}
                </Button>
              </div>

              <LanguageSwitcher className="shrink-0" />
            </div>
          </div>
        </header>
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
                  {t.billing.planDetails["self-learner"].name}
                </h1>
                <p className="text-muted-foreground">{t.selfLearner.heroSubtitle}</p>
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
              <Card
                className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl"
                data-testid="card-search-and-create"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.teacher.searchPlaceholder}
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
                            {t.selfLearner.noCourseFound.replace("{query}", searchQuery)}
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
                    {t.selfLearner.newCourse}
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
                  <h2 className="text-xl font-semibold">{t.selfLearner.myCourses}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t.selfLearner.courseCount.replace("{count}", String(cours.length))}
                  </p>
                </div>
              </div>

              {cours.length === 0 ? (
                <Card className="p-10 text-center bg-card/50 backdrop-blur-sm border-dashed">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t.selfLearner.emptyTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{t.selfLearner.emptyHint}</p>
                  <Button
                    onClick={handleOpenCreateModal}
                    className="shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500"
                    data-testid="button-create-first-cours"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.selfLearner.createFirst}
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
                            onClick={() => handleDeleteCourse(c.id)}
                            data-testid={`button-delete-cours-${c.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
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
                          {t.selfLearner.details}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-amber-500 hover:bg-amber-600"
                          onClick={() => handleCourseReview(c)}
                          data-testid={`button-reviser-cours-${c.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {t.selfLearner.revise}
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
                {t.selfLearner.createModalTitle}
              </DialogTitle>
              <DialogDescription>{t.selfLearner.createModalDesc}</DialogDescription>
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
                            <FormLabel>{t.teacher.createModal.courseName}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t.selfLearner.titlePlaceholder}
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
                            <FormLabel>{t.teacher.createModal.language}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-new-cours-langue">
                                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <SelectValue placeholder={t.teacher.createModal.language} />
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
                          <FormLabel>{t.teacher.createModal.courseContent}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.teacher.createModal.courseContentPlaceholder}
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
                      <FormLabel>{t.teacher.createModal.pdfs}</FormLabel>
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
                          {t.teacher.createModal.selectPdfs}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">{t.teacher.addCourse.pdfs}</p>
                      </div>

                      {selectedPdfFiles.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {selectedPdfFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
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
                    <Button type="button" variant="outline" onClick={handleCloseCreateModal} disabled={isCreating}>
                      {t.common.cancel}
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
                          {t.selfLearner.creating}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {t.selfLearner.createCourse}
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
          <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden [&>button]:hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-2xl sm:!w-[95vw] sm:!h-[85vh] sm:!rounded-2xl sm:!border">
            {selectedCours && (
              <>
                <DialogHeader
                  className="px-4 pt-4 pb-3 border-b flex-shrink-0 sm:px-6 sm:pt-6 sm:pb-4"
                  style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
                >
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
                            {isSavingRename ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-600" />
                            )}
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
                  <DialogDescription>{t.selfLearner.manageCourse}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <Tabs value={courseTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                    <TabsList className="w-full justify-start px-6 pt-2 bg-transparent border-b rounded-none">
                      <TabsTrigger value="content" className="gap-2">
                        <FileText className="h-4 w-4" />
                        {t.teacher.addCourse.content}
                      </TabsTrigger>
                      <TabsTrigger value="questions" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Questions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="flex-1 overflow-y-auto p-6 m-0">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">{t.teacher.createModal.language}</h4>
                          <Badge variant="outline">{langueLabels[selectedCours.language as Language]}</Badge>
                        </div>

                        {selectedCours.contentText && (
                          <div>
                            <h4 className="font-medium mb-2">{t.teacher.addCourse.content}</h4>
                            <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                              {selectedCours.contentText}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{t.teacher.addCourse.pdfs}</h4>
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
                                {t.teacher.createModal.selectPdfs}
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
                              <p className="text-sm text-muted-foreground mb-3">{t.dashboard.courseTester.noPdfs}</p>
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
                                {t.teacher.createModal.selectPdfs}
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
                                        const success = await deleteSelfLearnerCourseFile(fichier);
                                        if (success) {
                                          setCourseFiles((prev) => prev.filter((f) => f.id !== fichier.id));
                                          toast({ title: t.selfLearner.fileDeleted });
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
                            onClick={() => setCourseTab("content")}
                            data-testid="button-back-to-content"
                          >
                            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                            {t.common.back}
                          </Button>
                          <div className="flex-1" />
                          <Badge variant="outline" className="text-sm">
                            {t.dashboard.courseTester.generatedCount.replace("{count}", String(coursQuestions.length))}
                          </Badge>
                        </div>

                        {/* Main scrollable content */}
                        <div className="flex-1 overflow-y-auto p-6">
                          {/* Question generation section - only show if no questions yet */}
                          {coursQuestions.length === 0 && !loadingQuestions && (
                            <Card className="p-5 bg-amber-500/5 border-amber-500/20 mb-6">
                              <h4 className="font-medium mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                {t.selfLearner.generateQuestionsAI}
                              </h4>

                              <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{t.teacher.questionGenerator.mcqLabel}</p>
                                  <p className="text-xs text-muted-foreground">{t.selfLearner.mcqHint}</p>
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
                                  <p className="font-medium text-sm">{t.teacher.questionGenerator.openLabel}</p>
                                  <p className="text-xs text-muted-foreground">{t.selfLearner.openHint}</p>
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
                                    {t.selfLearner.generating}
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {t.selfLearner.generateCount.replace("{count}", String(qcmCount + ouverteCount))}
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
                              <p className="text-sm text-muted-foreground">{t.selfLearner.generating}</p>
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
                                          {t.selfLearner.createOpen}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                          {t.teacher.editQuestion.question}
                                        </label>
                                        <Textarea
                                          value={editingQuestionText}
                                          onChange={(e) => setEditingQuestionText(e.target.value)}
                                          className="min-h-[80px] text-sm"
                                          data-testid={`textarea-edit-question-${index}`}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                          {t.selfLearner.expectedAnswer}
                                        </label>
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
                                          {t.common.cancel}
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={handleSaveQuestion}
                                          className="bg-amber-500 hover:bg-amber-600"
                                          data-testid={`button-save-question-${index}`}
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          {t.common.save}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${q.type === "single" ? "border-indigo-500/50 text-indigo-600 dark:text-indigo-400" : ""}`}
                                          >
                                            {q.type === "single"
                                              ? t.teacher.questionGenerator.mcqLabel
                                              : t.selfLearner.createOpen}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                        </div>
                                        <p className="text-sm font-medium mb-2">{q.questionText}</p>

                                        {/* QCM propositions */}
                                        {q.type === "single" && q.proposals && q.proposals.length > 0 && (
                                          <div className="space-y-1 mb-2">
                                            {q.proposals.map((prop: string, propIndex: number) => (
                                              <div
                                                key={propIndex}
                                                className={`text-xs p-2 rounded flex items-center gap-2 ${
                                                  prop === q.correctAnswers?.[0]
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                    : "bg-muted/50 text-muted-foreground"
                                                }`}
                                              >
                                                {prop === q.correctAnswers?.[0] && (
                                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                )}
                                                <span>{prop}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Open question answer */}
                                        {q.type === "open" && q.correctAnswers?.[0] && (
                                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                            <span className="font-medium">{t.selfLearner.expectedAnswerLabel}</span>
                                            {q.correctAnswers?.[0]}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {q.type === "open" && (
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
                                <div className="text-xs text-muted-foreground font-medium">
                                  {t.selfLearner.generateWithAI}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-dashed"
                                    onClick={() => handleGenerateSelfLearnerQuestion("single")}
                                    disabled={isGenerating || isCreatingManualQuestion}
                                    data-testid="button-add-one-qcm"
                                  >
                                    {isGenerating ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    {t.selfLearner.createQcm}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-dashed"
                                    onClick={() => handleGenerateSelfLearnerQuestion("open")}
                                    disabled={isGenerating || isCreatingManualQuestion}
                                    data-testid="button-add-one-ouverte"
                                  >
                                    {isGenerating ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    {t.selfLearner.createOpen}
                                  </Button>
                                </div>

                                {/* Add question buttons - Manual */}
                                <div className="text-xs text-muted-foreground font-medium mt-4">
                                  {t.selfLearner.createManually}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-dashed"
                                    onClick={() => openManualQuestionModal("single")}
                                    disabled={isGenerating || isCreatingManualQuestion}
                                    data-testid="button-manual-qcm"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t.selfLearner.createQcm}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-dashed"
                                    onClick={() => openManualQuestionModal("open")}
                                    disabled={isGenerating || isCreatingManualQuestion}
                                    data-testid="button-manual-ouverte"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t.selfLearner.createOpen}
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
                              {t.selfLearner.validateAndChat}
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

        {courseForChatbot && (
          <SelfLearnerChatbotModal
            open={chatbotModalOpen}
            onOpenChange={(open: boolean) => {
              setChatbotModalOpen(open);
              if (!open) setCourseForChatbot(null);
            }}
            cours={courseForChatbot}
            generateQuestions={async (coursId: string) => {
              return generateQuestions(coursId, {
                simpleCount: qcmCount,
                openedCount: ouverteCount,
                totalQuestions: qcmCount + ouverteCount,
              });
            }}
          />
        )}

        <Dialog
          open={renameCardModalOpen}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setRenameCardModalOpen(false);
              setRenameCardCourseId(null);
              setRenameCardValue("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.teacher.renameModal.title}</DialogTitle>
              <DialogDescription>{t.teacher.renameModalDesc}</DialogDescription>
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
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={handleConfirmCardRename}
                  disabled={isSavingCardRename || !renameCardValue.trim()}
                  className="bg-amber-500 hover:bg-amber-600"
                  data-testid="button-confirm-card-rename"
                >
                  {isSavingCardRename ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t.teacher.renameSession}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* PDF Viewer Dialog */}
        <Dialog
          open={pdfViewerOpen}
          onOpenChange={(open) => {
            setPdfViewerOpen(open);
            if (!open) setPdfViewerUrl(null);
          }}
        >
          <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-4xl sm:!w-[95vw] sm:!h-[90vh] sm:!rounded-2xl sm:!border">
            <DialogHeader
              className="px-4 pt-4 pb-3 border-b flex-shrink-0 sm:px-6"
              style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
            >
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  {t.teacher.addCourse.pdfs}
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden bg-muted/30">
              {pdfViewerUrl && <iframe src={pdfViewerUrl} className="w-full h-full border-0" title="PDF Viewer" />}
            </div>
          </DialogContent>
        </Dialog>

        {/* Manual Question Creation Modal */}
        <Dialog open={manualQuestionModalOpen} onOpenChange={setManualQuestionModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {manualQuestionType === "single" ? t.selfLearner.createQcm : t.selfLearner.createOpen}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>{t.teacher.editQuestion.question}</Label>
                <Textarea
                  value={manualQuestionText}
                  onChange={(e) => setManualQuestionText(e.target.value)}
                  placeholder={t.teacher.editQuestion.question}
                  className="min-h-[80px]"
                  data-testid="input-manual-question"
                />
              </div>

              {manualQuestionType === "single" && (
                <div className="space-y-2">
                  <Label>{t.dashboard.courseTester.qcmOneAnswer}</Label>
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
                        placeholder={`${t.teacher.editQuestion.question} ${String.fromCharCode(65 + index)}`}
                        data-testid={`input-proposition-${index}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  {manualQuestionType === "single" ? t.selfLearner.goodAnswerSelect : t.selfLearner.expectedAnswer}
                </Label>
                {manualQuestionType === "single" ? (
                  <Select value={manualQuestionAnswer} onValueChange={setManualQuestionAnswer}>
                    <SelectTrigger data-testid="select-correct-answer">
                      <SelectValue placeholder={t.selfLearner.selectGoodAnswer} />
                    </SelectTrigger>
                    <SelectContent>
                      {manualQcmPropositions
                        .filter((p: string) => p.trim())
                        .map((prop: string, index: number) => (
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
                    placeholder={t.selfLearner.enterExpectedAnswer}
                    className="min-h-[60px]"
                    data-testid="input-manual-answer"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.teacher.editQuestion.explanation}</Label>
                <Textarea
                  value={manualQuestionExplication}
                  onChange={(e) => setManualQuestionExplication(e.target.value)}
                  placeholder={t.selfLearner.explanationPlaceholder}
                  className="min-h-[60px]"
                  data-testid="input-manual-explication"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setManualQuestionModalOpen(false)}
                disabled={isCreatingManualQuestion}
              >
                {t.common.cancel}
              </Button>
              <Button
                onClick={handleCreateManualQuestion}
                disabled={isCreatingManualQuestion}
                data-testid="button-create-manual-question"
              >
                {isCreatingManualQuestion ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {t.selfLearner.createQuestion}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SubscriptionBlockModal>
  );
}
