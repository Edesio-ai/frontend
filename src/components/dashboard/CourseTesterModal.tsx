import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Course, CourseFile, Question, CourseRanking, UpdateQuestionRequest } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FileText,
  X,
  Upload,
  Sparkles,
  FileDown,
  CheckCircle2,
  ListChecks,
  Trash2,
  RefreshCw,
  Files,
  MessageSquare,
  BookOpen,
  Plus,
  Trophy,
  Award,
  Download,
  ArrowLeft
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { exportClassementPdf } from "@/lib/pdf-export";
import { courseService } from "@/services/course.service";
import { QuestionGenerator } from "../teacher/QuestionGenerator";
import { MAX_QUESTIONS } from "@/utils/constants/teacher";
import { GenerateQuestionsConfig } from "@/types/question.type";
import { SortableQuestionItem } from "../teacher/SotableQuestionItem";
import { exportService } from "@/services/export.service";
import { EditQuestionTesterModalSection } from "../teacher/CourseTesterModal/EditQuestionTesterModalSection";
import { FileSectionTesterModal } from "../teacher/CourseTesterModal/FileSectionTesterModal";
import { QuestionSectionTesterModal } from "../teacher/CourseTesterModal/QuestionSectionTesterModal";
import { RegenerateQuestionModal } from "../teacher/CourseTesterModal/RegenerateQuestionModal";
import { ChatbotModal } from "../teacher/CourseTesterModal/ChatbotModal";



interface CourseTesterModalProps {
  course: Course;
  allCourses: Course[];
  sessionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateCourse: (
    courseId: string,
    title: string,
    description: string | null,
    contentText: string | null
  ) => Promise<Course | null>;
  uploadPdfForCourse: (courseId: string, file: File) => Promise<CourseFile | null>;
  fetchCourseFiles: (courseId: string) => Promise<CourseFile[]>;
  deleteCourseFile: (file: CourseFile) => Promise<boolean>;
  getPdfUrl: (fileId: string, fileName: string) => Promise<void>;
  fetchQuestions: (courseId: string) => Promise<Question[]>;
  updateQuestion: (
    questionId: string,
    updates: UpdateQuestionRequest
  ) => Promise<Question | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  createQuestion: (
    courseId: string,
    questionData: {
      type: "single" | "open" | "multiple";
      questionText: string;
      propositions?: string[];
      correctAnswer?: string;
      correctAnswers?: string[];
      explanation?: string;
    }
  ) => Promise<Question | null>;
  generateQuestions: (
    courseId: string,
    config?: GenerateQuestionsConfig
  ) => Promise<{ success: boolean; questionCount?: number; questions?: Question[]; error?: string }>;
  validateQuestions: (courseId: string) => Promise<{ success: boolean; course?: Course; error?: string }>;
  reorderQuestions?: (questionIds: string[]) => Promise<boolean>;
  fetchCourseRanking?: (courseId: string) => Promise<CourseRanking[]>;
  onCourseUpdated: (updatedCourse: Course) => void;
}

export function CourseTesterModal({
  course,
  allCourses,
  sessionName,
  open,
  onOpenChange,
  updateCourse,
  uploadPdfForCourse,
  fetchCourseFiles,
  deleteCourseFile,
  getPdfUrl,
  fetchQuestions,
  updateQuestion,
  deleteQuestion,
  createQuestion,
  generateQuestions,
  validateQuestions,
  reorderQuestions,
  fetchCourseRanking,
  onCourseUpdated,
}: CourseTesterModalProps) {
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rankings, setRankings] = useState<CourseRanking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState(course.title);
  const [editedDescription, setEditedDescription] = useState(course.description || "");
  const [editedContent, setEditedContent] = useState(course.contentText || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CourseFile | null>(null);
  const [isDeletingFichier, setIsDeletingFichier] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatbotRefreshKey, setChatbotRefreshKey] = useState(0);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<"single" | "open">("single");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newProposals, setNewProposals] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newCorrectIndices, setNewCorrectIndices] = useState<number[]>([]);
  const [newGoodAnswer, setNewGoodAnswer] = useState("");
  const [newExplication, setNewExplication] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [chatbotModalOpen, setChatbotModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Question generation configuration (max 20 questions total for token safety)

  const [genTotalQuestions, setGenTotalQuestions] = useState(10);
  const [singleGenCount, setGenSingleCount] = useState(5);
  const [openGenerateCount, setGenOpenCount] = useState(5);
  // Phase control: questions not validated = phase 1, validated = phase 2
  // Use local state to track validation status (refreshed from DB when modal opens)
  const [questionsValidated, setQuestionsValidated] = useState(course.validatedQuestions);
  // Phase 1 sub-view: course editing vs question generation
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);

  // DnD sensors for questions reordering
  const questionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleQuestionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    const previousQuestions = [...questions];
    const newQuestions = arrayMove(questions, oldIndex, newIndex);
    setQuestions(newQuestions);

    if (reorderQuestions) {
      try {
        const success = await reorderQuestions(newQuestions.map((q) => q.id));
        if (!success) {
          setQuestions(previousQuestions);
        }
      } catch (err) {
        console.error("Error reordering questions:", err);
        setQuestions(previousQuestions);
      }
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
      setShowQuestionGenerator(true);
    }
  }, [open, course.id]);

  useEffect(() => {
    setEditedTitle(course.title);
    setEditedDescription(course.description || "");
    setEditedContent(course.contentText || "");
    setQuestionsValidated(course.validatedQuestions);
  }, [course]);

  const loadData = async () => {
    setLoading(true);

    const freshCourse = await courseService.getCourseValidatedQuestions(course.id);
    if (freshCourse) {
      setQuestionsValidated(freshCourse.validatedQuestions);
    }
    const [fileData, questionsData] = await Promise.all([
      fetchCourseFiles(course.id),
      fetchQuestions(course.id),
    ]);

    setFiles(fileData);
    setQuestions(questionsData);
    setLoading(false);

    if (fetchCourseRanking) {
      setLoadingRankings(true);
      const rankingsData = await fetchCourseRanking(course.id);
      setRankings(rankingsData);
      setLoadingRankings(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updated = await updateCourse(
      course.id,
      editedTitle,
      editedDescription || null,
      editedContent || null
    );
    if (updated) {
      onCourseUpdated(updated);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    const newFile = await uploadPdfForCourse(course.id, file);
    if (newFile) {
      setFiles((prev) => [...prev, newFile]);
    }
    setIsUploadingPdf(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteFile = (fichier: CourseFile) => {
    setFileToDelete(fichier);
    setDeleteDialogOpen(true);
  };

  const handleDownloadQuestionsPdf = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await exportService.exportQuestionsPdf(questions, course.title, sessionName);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeletingFichier(true);
    const success = await deleteCourseFile(fileToDelete);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
    }
    setIsDeletingFichier(false);
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const handleDownloadPdf = async (fichier: CourseFile) => {
    await getPdfUrl(fichier.id, fichier.fileName);
  };

  const handleGenerateQuestions = () => {
    setRegenerateDialogOpen(true);
  };

  const executeGeneration = async () => {
    setRegenerateDialogOpen(false);
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      const config = {
        totalQuestions: genTotalQuestions,
        singleCount: singleGenCount,
        openedCount: openGenerateCount
      };

      const { questionCount, success, questions} = await generateQuestions(course.id, config);
 

      if (success) {
        setGenerateSuccess(`${questionCount} questions générées avec succès !`);
        if (questions && questions.length > 0) {
          console.log("Using questions directly from generation response:", questionCount);
          setQuestions(questions);
        } else {
          console.log("No questions in response, fetching from API...");
          const newQuestions = await fetchQuestions(course.id);
          console.log("Fetched questions after generation:", newQuestions.length);
          setQuestions(newQuestions);
        }
      }
    } catch (error) {
      console.error("Error during generation:", error);
      setGenerateError("Une erreur inattendue s'est produite");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (field: 'single' | 'open', value: number) => {
    const newValue = Math.max(0, Math.min(MAX_QUESTIONS, value));
    let newSingleQuestion = singleGenCount;
    let newOpenQuestion = openGenerateCount;

    if (field === 'single') newSingleQuestion = newValue;
    if (field === 'open') newOpenQuestion = newValue;

    let total = newSingleQuestion + newOpenQuestion;

    // Limit total to MAX_QUESTIONS
    if (total > MAX_QUESTIONS) {
        if (field === 'single') {
        newSingleQuestion = Math.max(0, MAX_QUESTIONS - newOpenQuestion);
      } else {
        newOpenQuestion = Math.max(0, MAX_QUESTIONS - newSingleQuestion);
      }
      total = newSingleQuestion + newOpenQuestion;
    }
    setGenSingleCount(newSingleQuestion);
    setGenOpenCount(newOpenQuestion);
    setGenTotalQuestions(total);
  };

  const handleQuestionUpdated = (updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const handleQuestionDeleted = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const resetAddQuestionForm = () => {
    setNewQuestionType("single");
    setNewQuestionText("");
    setNewProposals(["", "", "", ""]);
    setNewCorrectIndex(0);
    setNewCorrectIndices([]);
    setNewGoodAnswer("");
    setNewExplication("");
  };

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) return;
    if (questions.length >= MAX_QUESTIONS) return;

    setIsAddingQuestion(true);

    const questionData: {
      type: "single" | "open";
      questionText: string;
      correctAnswers: string[];
      proposals?: string[];
      explanation?: string;
    } = {
      type: newQuestionType,
      questionText: newQuestionText,
      explanation: newExplication || undefined,
      correctAnswers: []
    };

    if (newQuestionType === "single") {
      const filteredProposals = newProposals.filter(p => p.trim() !== "");
      if (filteredProposals.length < 2) {
        setIsAddingQuestion(false);
        return;
      }
      questionData.proposals = filteredProposals;
      questionData.correctAnswers.push(filteredProposals[newCorrectIndex] || filteredProposals[0])
    } else {
      if(newGoodAnswer) {
        questionData.correctAnswers.push(newGoodAnswer);
      }
    }

    const result = await createQuestion(course.id, questionData);

    if (result) {
      setQuestions((prev) => [...prev, result]);
      resetAddQuestionForm();
      setAddQuestionOpen(false);
    }

    setIsAddingQuestion(false);
  };

  const handleValidateQuestions = async () => {
    if (questions.length === 0) {
      setValidateError("Vous devez d'abord générer des questions");
      return;
    }

    setIsValidating(true);
    setValidateError(null);

    const result = await validateQuestions(course.id);

    if (result.success && result.course) {
      onCourseUpdated(result.course);
      setQuestionsValidated(true);
    } else {
      setValidateError(result.error || "Erreur lors de la validation");
    }

    setIsValidating(false);
  };

  const currentSingleCount = questions.filter(
    (q) => q.type === "single" || q.type === "multiple",
  ).length;
  const currentOpenCount = questions.filter((q) => q.type === "open").length;

  // Shared Add Question Dialog (used in both phases)
  const renderAddQuestionDialog = () => (
    <Dialog open={addQuestionOpen} onOpenChange={(open) => {
      setAddQuestionOpen(open);
      if (!open) resetAddQuestionForm();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une question
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle question pour ce course ({questions.length}/{MAX_QUESTIONS})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de question</label>
            <Select value={newQuestionType} onValueChange={(v) => setNewQuestionType(v as "single" | "open")}>
              <SelectTrigger data-testid="select-new-question-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">QCM (1 bonne réponse)</SelectItem>
                <SelectItem value="open">Question ouverte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <Textarea
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Entrez le texte de la question..."
              className="min-h-[80px]"
              data-testid="input-new-question-text"
            />
          </div>

          {newQuestionType === "single" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Propositions</label>
              <p className="text-xs text-muted-foreground">Cliquez sur le bouton pour marquer la bonne réponse</p>
              {newProposals.map((prop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-medium text-sm w-5">{String.fromCharCode(65 + i)}.</span>
                  <Input
                    value={prop}
                    onChange={(e) => {
                      const newProps = [...newProposals];
                      newProps[i] = e.target.value;
                      setNewProposals(newProps);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className={newCorrectIndex === i ? "border-green-500" : ""}
                    data-testid={`input-new-proposition-${i}`}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={newCorrectIndex === i ? "default" : "outline"}
                    onClick={() => setNewCorrectIndex(i)}
                    className="h-9 w-9 p-0"
                    data-testid={`button-new-correct-${i}`}
                  >
                    {newCorrectIndex === i ? <CheckCircle2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 opacity-30" />}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {newQuestionType === "open" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Réponse attendue</label>
              <Textarea
                value={newGoodAnswer}
                required={newQuestionType === "open"}
                onChange={(e) => setNewGoodAnswer(e.target.value)}
                placeholder="La réponse attendue..."
                className="min-h-[60px]"
                data-testid="input-new-answer"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Explication (optionnelle)</label>
            <Textarea
              value={newExplication}
              onChange={(e) => setNewExplication(e.target.value)}
              placeholder="Explication de la réponse..."
              className="min-h-[60px]"
              data-testid="input-new-explanation"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAddQuestionOpen(false)} disabled={isAddingQuestion}>
            Annuler
          </Button>
          <Button
            onClick={handleAddQuestion}
            disabled={
              isAddingQuestion ||
              !newQuestionText.trim() ||
              (newQuestionType === "single" && newProposals.filter(p => p.trim()).length < 2)
            }
            data-testid="button-confirm-add-question"
          >
            {isAddingQuestion ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Ajout...</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" /> Ajouter</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Phase 1: Course editing + question generation interface (questions not yet validated)
  if (!questionsValidated) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-3">
                {showQuestionGenerator && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQuestionGenerator(false)}
                    data-testid="button-back-to-course-edit"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <DialogTitle className="flex flex-wrap items-center gap-2">
                    {showQuestionGenerator ? (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Créer les questions - {course.title}
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-5 w-5" />
                        {course.title}
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {showQuestionGenerator
                      ? "Générez ou ajoutez manuellement les questions pour ce course"
                      : "Modifiez le contenu du course avant de générer les questions"
                    }
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : showQuestionGenerator ? (
              <div className="flex-1 overflow-y-auto space-y-6 py-4">
                <QuestionGenerator
                  genSingleCount={singleGenCount}
                  genOpenedCount={openGenerateCount}
                  handleConfigChange={handleConfigChange}
                  executeGeneration={executeGeneration}
                  isGenerating={isGenerating}
                  genTotalQuestions={genTotalQuestions}
                  generateError={generateError}
                  generateSuccess={generateSuccess}
                />

                {/* Manual add section */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="font-medium flex flex-wrap items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter manuellement
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        Créez vos propres questions une par une
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetAddQuestionForm();
                        setAddQuestionOpen(true);
                      }}
                      disabled={questions.length >= MAX_QUESTIONS}
                      data-testid="button-add-manual-question-phase1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {questions.length >= MAX_QUESTIONS && (
                    <p className="text-xs text-amber-600">
                      Limite de {MAX_QUESTIONS} questions atteinte
                    </p>
                  )}
                </div>

                {/* Questions list */}
                {questions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="font-medium text-sm flex flex-wrap items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        Questions générées ({questions.length})
                      </h5>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownloadQuestionsPdf(e)}
                        data-testid="button-export-questions-pdf"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </Button>
                    </div>
                    <DndContext
                      sensors={questionSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleQuestionDragEnd}
                    >
                      <SortableContext
                        items={questions.map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {questions.map((q, index) => (
                            <SortableQuestionItem
                              key={q.id}
                              question={q}
                              index={index}
                              updateQuestion={updateQuestion}
                              deleteQuestion={deleteQuestion}
                              onQuestionUpdated={(updated) => {
                                setQuestions((prev) =>
                                  prev.map((pq) => (pq.id === updated.id ? updated : pq))
                                );
                              }}
                              onQuestionDeleted={(deletedId) => {
                                setQuestions((prev) => prev.filter((pq) => pq.id !== deletedId));
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* Validate button */}
                {questions.length > 0 && (
                  <div className="pt-4 border-t">
                    {validateError && (
                      <p className="text-sm text-destructive mb-2">{validateError}</p>
                    )}
                    <Button
                      onClick={handleValidateQuestions}
                      disabled={isValidating || questions.length === 0}
                      className="w-full"
                      size="lg"
                      data-testid="button-validate-questions"
                    >
                      {isValidating ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Validation...</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Valider les questions</>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Une fois validées, vous pourrez tester le chatbot élève
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6 py-4">
                {/* Course editing section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Titre du course</label>
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Titre du cours"
                      data-testid="input-course-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description (optionnel)</label>
                    <Input
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Description du cours..."
                      data-testid="input-course-description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Contenu texte (optionnel)</label>
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Ajoutez du contenu texte pour aider l'IA à générer des questions..."
                      data-testid="input-course-content"
                    />
                  </div>
                </div>

                {/* PDF section */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="font-medium flex flex-wrap items-center gap-2">
                      <Files className="h-4 w-4" />
                      Fichiers PDF ({files.length})
                    </h5>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        data-testid="input-pdf-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPdf}
                        data-testid="button-upload-pdf"
                      >
                        {isUploadingPdf ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Upload...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-1" /> Ajouter PDF</>
                        )}
                      </Button>
                    </div>
                  </div>
                  {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun fichier PDF. Ajoutez des PDFs pour améliorer la génération de questions.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {files.map((f) => (
                        <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-muted/30 text-sm">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{f.fileName}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(f)} data-testid={`button-download-pdf-${f.id}`}>
                              <FileDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteFile(f)} data-testid={`button-delete-pdf-${f.id}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Continue to questions button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={async () => {
                      // Save course changes before going to questions
                      if (editedTitle !== course.title || editedDescription !== (course.description || "") || editedContent !== (course.contentText || "")) {
                        setIsSaving(true);
                        const updated = await updateCourse(course.id, editedTitle, editedDescription || null, editedContent || null);
                        if (updated) {
                          onCourseUpdated(updated);
                        }
                        setIsSaving(false);
                      }
                      setShowQuestionGenerator(true);
                    }}
                    className="w-full"
                    size="lg"
                    disabled={isSaving || !editedTitle.trim()}
                    data-testid="button-continue-to-questions"
                  >
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Continuer vers les questions</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete file confirmation dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le fichier sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingFichier}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteFile} disabled={isDeletingFichier} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeletingFichier ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {renderAddQuestionDialog()}
      </>
    );
  }

  // Phase 2: Full interface with chatbot (questions validated)
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[1200px] h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {course.title}
            </DialogTitle>
            <DialogDescription>
              Gérez le contenu du course et utilisez le bouton "Tester le chatbot" pour simuler l'expérience élève
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              <EditQuestionTesterModalSection
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleSave={handleSave}
                isSaving={isSaving}
                course={course}
                editedTitle={editedTitle}
                setEditedTitle={setEditedTitle}
                editedDescription={editedDescription} 
                setEditedDescription={setEditedDescription} 
                editedContent={editedContent}
                setEditedContent={setEditedContent}
              />
              <FileSectionTesterModal
                files={files}
                handleFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                isUploadingPdf={isUploadingPdf}
                handleDownloadPdf={handleDownloadPdf}
                handleDeleteFile={handleDeleteFile}
              />
              <QuestionSectionTesterModal 
                questions={questions}
                handleGenerateQuestions={handleGenerateQuestions}
                isGenerating={isGenerating}
                generateError={generateError}
                generateSuccess={generateSuccess}
                setChatbotModalOpen={setChatbotModalOpen}
                setAddQuestionOpen={setAddQuestionOpen}
                currentSingleCount={currentSingleCount}
                currentOpenCount={currentOpenCount}
                handleQuestionDragEnd={handleQuestionDragEnd}
                handleQuestionUpdated={handleQuestionUpdated}
                handleQuestionDeleted={handleQuestionDeleted}
                updateQuestion={updateQuestion}
                deleteQuestion={deleteQuestion}
                handleDownloadQuestionsPdf={handleDownloadQuestionsPdf}
                questionSensors={questionSensors}
              />

              {/* Rankings Section */}
              {fetchCourseRanking && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="font-medium text-sm flex flex-wrap items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Classement des élèves {rankings.length > 0 && `(${rankings.length})`}
                    </h5>
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (!fetchCourseRanking) return;
                          try {
                            setLoadingRankings(true);
                            const rankingsData = await fetchCourseRanking(course.id);
                            setRankings(rankingsData);
                          } catch (error) {
                            console.error("Erreur lors du rafraîchissement:", error);
                          } finally {
                            setLoadingRankings(false);
                          }
                        }}
                        disabled={loadingRankings}
                        title="Rafraîchir le classement"
                        data-testid="button-refresh-rankings"
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingRankings ? 'animate-spin' : ''}`} />
                      </Button>
                      {rankings.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportClassementPdf(rankings, course.title, sessionName)}
                          data-testid="button-export-rankings-pdf"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>

                  {loadingRankings ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : rankings.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md">
                      <Trophy className="h-6 w-6 mx-auto opacity-50 mb-2" />
                      <p>Aucun élève n'a encore participé.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {rankings.map((ranking) => (
                        <Card
                          key={ranking.studentId}
                          className={`p-3 flex items-center gap-3 ${ranking.rank <= 3 ? 'border-primary/30' : ''}`}
                          data-testid={`ranking-item-${ranking.studentId}`}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
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
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={ranking.photoUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {ranking.name?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{ranking.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ranking.correctAnswers}/{ranking.attemptedQuestions} réponses correctes
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm">
                              {Math.round(ranking.successRate)}%
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ChatbotModal
        course={course}
        allCourses={allCourses}
        sessionName={sessionName}
        fetchQuestions={fetchQuestions}
        chatbotRefreshKey={chatbotRefreshKey}
        setChatbotRefreshKey={setChatbotRefreshKey}
        chatbotModalOpen={chatbotModalOpen}
        setChatbotModalOpen={setChatbotModalOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer « {fileToDelete?.fileName} » ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingFichier}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} disabled={isDeletingFichier} className="bg-destructive text-destructive-foreground">
              {isDeletingFichier ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RegenerateQuestionModal
        singleGenCount={singleGenCount}
        regenerateDialogOpen={regenerateDialogOpen}
        setRegenerateDialogOpen={setRegenerateDialogOpen}
        handleConfigChange={handleConfigChange}
        executeGeneration={executeGeneration}
        genTotalQuestions={genTotalQuestions}
        questions={questions}
        openGenerateCount={openGenerateCount}
      />

      {renderAddQuestionDialog()}
    </>
  );
}
