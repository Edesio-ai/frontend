import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CourseTesterModal } from "./CourseTesterModal";
import type { Session, Course, CourseFile, Question, CourseRanking } from "@/types";
import { 
  Plus, 
  Loader2, 
  FileText, 
  Calendar, 
  X,
  BookOpen, 
  Upload, 
  ChevronRight,
  GripVertical,
  Pencil,
  Check,
  Trash2
} from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const formSchema = z.object({
  titre: z.string().min(1, "Le titre est requis").max(200, "Le titre est trop long"),
  description: z.string().max(500, "La description est trop longue").optional().or(z.literal("")),
  contenuTexte: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseListProps {
  session: Session;
  fetchCours: (sessionId: string) => Promise<Course[]>;
  createCourse: (
    sessionId: string,
    titre: string,
    description: string,
    contenuTexte: string,
    pdfFiles?: File[]
  ) => Promise<Course | null>;
  updateCours: (
    coursId: string,
    titre: string,
    description: string | null,
    contenuTexte: string | null
  ) => Promise<Course | null>;
  deleteCours?: (coursId: string) => Promise<boolean>;
  reorderCours?: (coursIds: string[]) => Promise<boolean>;
  uploadPdfForCours: (coursId: string, file: File) => Promise<CourseFile | null>;
  fetchCoursFichiers: (coursId: string) => Promise<CourseFile[]>;
  deleteCoursFichier: (fichier: CourseFile) => Promise<boolean>;
  getPdfUrl: (filePath: string) => Promise<string | null>;
  fetchQuestions: (coursId: string) => Promise<Question[]>;
  updateQuestion: (
    questionId: string,
    updates: {
      type?: "single" | "multiple" | "open";
      question?: string;
      propositions?: string[] | null;
      good_answer?: string | null;
      good_answers?: string[] | null;
      explanation?: string | null;
    }
  ) => Promise<Question | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  createQuestion: (
    coursId: string,
    questionData: {
      type: "single" | "multiple" | "open";
      question: string;
      propositions?: string[];
      bonne_reponse?: string;
      bonnes_reponses?: string[];
      explication?: string;
    }
  ) => Promise<Question | null>;
  reorderQuestions?: (questionIds: string[]) => Promise<boolean>;
  generateQuestions: (
    coursId: string,
    config?: { totalQuestions?: number; qcmCount?: number; ouverteCount?: number }
  ) => Promise<{ success: boolean; questionsCreated?: number; error?: string }>;
  validateQuestions: (coursId: string) => Promise<{ success: boolean; cours?: Course; error?: string }>;
  fetchCoursClassement?: (coursId: string) => Promise<CourseRanking[]>;
  onClose: () => void;
  initialCoursToOpen?: Course | null;
  onInitialCoursOpened?: () => void;
}

interface SortableCourseItemProps {
  cours: Course;
  onSelect: (cours: Course) => void;
  onRename: (coursId: string, newTitle: string) => void;
  onDelete?: (cours: Course) => void;
  formatDate: (dateStr: string) => string;
}

function SortableCourseItem({ cours, onSelect, onRename, onDelete, formatDate }: SortableCourseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(cours.titre);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cours.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(cours.titre);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle !== cours.titre) {
      onRename(cours.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit(e);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(cours.titre);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(cours);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg border bg-card hover-elevate cursor-pointer transition-all flex items-center gap-2"
      onClick={() => !isEditing && onSelect(cours)}
      data-testid={`card-course-${cours.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
        data-testid={`drag-handle-course-${cours.id}`}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
                data-testid={`input-rename-course-${cours.id}`}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleSaveEdit}
                data-testid={`button-confirm-rename-course-${cours.id}`}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h5 className="font-medium truncate" data-testid={`text-course-title-${cours.id}`}>
                  {cours.titre}
                </h5>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-50 hover:opacity-100 focus:opacity-100"
                  onClick={handleEditClick}
                  data-testid={`button-rename-course-${cours.id}`}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                {onDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-50 hover:opacity-100 focus:opacity-100 hover:text-destructive"
                    onClick={handleDeleteClick}
                    data-testid={`button-delete-course-${cours.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {cours.description && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {cours.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(cours.created_at)}</span>
              </div>
            </>
          )}
        </div>
        {!isEditing && (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

function AddCourseModal({
  open,
  onOpenChange,
  sessionId,
  createCourse,
  onCourseCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  createCourse: CourseListProps["createCourse"];
  onCourseCreated: (cours: Course) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      contenuTexte: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const newCours = await createCourse(
      sessionId,
      data.titre,
      data.description || "",
      data.contenuTexte || "",
      selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined
    );
    if (newCours) {
      onCourseCreated(newCours);
      form.reset();
      setSelectedPdfFiles([]);
      onOpenChange(false);
    }
    setIsSubmitting(false);
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedPdfFiles([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un nouveau cours
          </DialogTitle>
          <DialogDescription>
            Créez un cours en ajoutant un titre, des fichiers PDF et optionnellement du contenu texte.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
              <div className="space-y-4 pb-4">
                <FormField
                  control={form.control}
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du cours</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: La Révolution française"
                          {...field}
                          data-testid="input-course-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description courte</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Introduction aux causes et conséquences"
                          {...field}
                          data-testid="input-course-description"
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
                      data-testid="input-course-pdf"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-select-pdf"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedPdfFiles.length > 0 ? "Ajouter d'autres PDFs" : "Sélectionner des PDFs"}
                    </Button>
                    {selectedPdfFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPdfFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-2 py-1"
                          >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="max-w-[200px] truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => removeSelectedFile(index)}
                              data-testid={`button-remove-pdf-${index}`}
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
                  name="contenuTexte"
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
                          data-testid="textarea-course-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4 flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-add-course">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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
      </DialogContent>
    </Dialog>
  );
}

export function CourseList({ 
  session, 
  fetchCours, 
  createCourse, 
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
  fetchCoursClassement,
  onClose,
  initialCoursToOpen,
  onInitialCoursOpened
}: CourseListProps) {
  const [cours, setCours] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCours, setSelectedCours] = useState<Course | null>(null);
  const [openQuestionsForCours, setOpenQuestionsForCours] = useState<Course | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [coursToDelete, setCoursToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadCours = async () => {
    setLoading(true);
    const data = await fetchCours(session.id);
    setCours(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCours();
  }, [session.id]);

  useEffect(() => {
    if (initialCoursToOpen && !loading) {
      setSelectedCours(initialCoursToOpen);
      if (onInitialCoursOpened) {
        onInitialCoursOpened();
      }
    }
  }, [initialCoursToOpen, loading]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cours.findIndex((c) => c.id === active.id);
    const newIndex = cours.findIndex((c) => c.id === over.id);

    const previousCours = [...cours];
    const newCours = arrayMove(cours, oldIndex, newIndex);
    setCours(newCours);

    if (reorderCours) {
      try {
        const success = await reorderCours(newCours.map((c) => c.id));
        if (!success) {
          setCours(previousCours);
        }
      } catch (err) {
        console.error("Error reordering courses:", err);
        setCours(previousCours);
      }
    }
  };

  const handleRenameCours = async (coursId: string, newTitle: string) => {
    const coursToUpdate = cours.find((c) => c.id === coursId);
    if (!coursToUpdate) return;

    const updated = await updateCours(
      coursId,
      newTitle,
      coursToUpdate.description,
      coursToUpdate.contenu_texte
    );

    if (updated) {
      setCours((prev) =>
        prev.map((c) => (c.id === coursId ? updated : c))
      );
    }
  };

  const handleCourseCreated = (newCours: Course) => {
    setCours((prev) => [newCours, ...prev]);
    setSelectedCours(newCours);
  };

  const handleCoursUpdated = (updatedCours: Course) => {
    setCours((prev) =>
      prev.map((c) => (c.id === updatedCours.id ? updatedCours : c))
    );
    if (selectedCours?.id === updatedCours.id) {
      setSelectedCours(updatedCours);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteCours = (coursToRemove: Course) => {
    setCoursToDelete(coursToRemove);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!coursToDelete || !deleteCours) return;
    setIsDeleting(true);
    const success = await deleteCours(coursToDelete.id);
    if (success) {
      setCours((prev) => prev.filter((c) => c.id !== coursToDelete.id));
      if (selectedCours?.id === coursToDelete.id) {
        setSelectedCours(null);
      }
      setDeleteModalOpen(false);
      setCoursToDelete(null);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div data-testid="course-list-container">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course existants ({cours.length})
          </h4>
          <Button onClick={() => setAddModalOpen(true)} data-testid="button-open-add-course">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un cours
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : cours.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aucun cours pour cette session</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter un cours" pour commencer.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cours.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {cours.map((c) => (
                  <SortableCourseItem
                    key={c.id}
                    cours={c}
                    onSelect={setSelectedCours}
                    onRename={handleRenameCours}
                    onDelete={deleteCours ? handleDeleteCours : undefined}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddCourseModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        sessionId={session.id}
        createCourse={createCourse}
        onCourseCreated={handleCourseCreated}
      />

      {selectedCours && (
        <CourseTesterModal
          cours={selectedCours}
          allCours={cours}
          sessionName={session.name}
          open={!!selectedCours}
          onOpenChange={(open) => !open && setSelectedCours(null)}
          updateCours={updateCours}
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
          onCoursUpdated={handleCoursUpdated}
        />
      )}

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent data-testid="modal-delete-course">
          <DialogHeader>
            <DialogTitle className="text-destructive">Supprimer le cours ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les questions, fichiers PDF et statistiques associés au cours "{coursToDelete?.titre}" seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteModalOpen(false);
                setCoursToDelete(null);
              }}
              disabled={isDeleting}
              data-testid="button-cancel-delete-course"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              data-testid="button-confirm-delete-course"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
