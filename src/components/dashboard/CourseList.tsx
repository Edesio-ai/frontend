import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { CourseTesterModal } from "./CourseTesterModal";
import type {
  Session,
  Course,
  CourseFile,
  Question,
  CourseRanking,
} from "@/types";
import { 
  Plus, 
  Loader2, 
  FileText, 
  BookOpen, 
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AddCourseModal } from "../teacher/AddCourseModam";
import { SortableCourseItem } from "../teacher/SortableCoursetem";

interface CourseListProps {
  session: Session;
  fetchCourses: (sessionId: string) => Promise<Course[]>;
  createCourse: (
    sessionId: string,
    titre: string,
    description: string,
    contentText: string,
    pdfFiles?: File[]
  ) => Promise<Course | null>;
  updateCourse: (
    coursId: string,
    titre: string,
    description: string | null,
    contenuTexte: string | null
  ) => Promise<Course | null>;
  deleteCourse?: (courseId: string) => Promise<boolean>;
  reorderCourse?: (coursIds: string[]) => Promise<boolean>;
  uploadPdfForCourse: (coursId: string, file: File) => Promise<CourseFile | null>;
  fetchCourseFiles: (coursId: string) => Promise<CourseFile[]>;
  deleteCourseFile: (fichier: CourseFile) => Promise<boolean>;
  getPdfUrl: (filePath: string) => Promise<string | null>;
  fetchQuestions: (coursId: string) => Promise<Question[]>;
  updateQuestion: (
    questionId: string,
    updates: {
      type?: "single" | "multiple" | "open";
      question?: string;
      proposals?: Question["proposals"];
      correctAnswer?: string | null;
      correctAnswers?: string[] | null;
      explanation?: string | null;
    }
  ) => Promise<Question | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  createQuestion: (
    coursId: string,
    questionData: {
      type: "single" | "multiple" | "open";
      question: string;
      proposals?: string[];
      correctAnswer?: string;
      correctAnswers?: string[];
      explanation?: string;
    }
  ) => Promise<Question | null>;
  reorderQuestions?: (questionIds: string[]) => Promise<boolean>;
  generateQuestions: (
    coursId: string,
    config?: { totalQuestions?: number; qcmCount?: number; ouverteCount?: number }
  ) => Promise<{ success: boolean; questionsCreated?: number; error?: string }>;
  validateQuestions: (coursId: string) => Promise<{ success: boolean; cours?: Course; error?: string }>;
  fetchCourseRanking?: (coursId: string) => Promise<CourseRanking[]>;
  onClose: () => void;
  initialCoursToOpen?: Course | null;
  onInitialCoursOpened?: () => void;
}

export function CourseList({ 
  session, 
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
  fetchCourseRanking,
  initialCoursToOpen,
  onInitialCoursOpened
}: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [coursToDelete, setCourseToDelete] = useState<Course | null>(null);
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

  const loadCourse = async () => {
    setLoading(true);
    const data = await fetchCourses(session.id);
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCourse();
  }, [session.id]);

  useEffect(() => {
    if (initialCoursToOpen && !loading) {
      setSelectedCourse(initialCoursToOpen);
      if (onInitialCoursOpened) {
        onInitialCoursOpened();
      }
    }
  }, [initialCoursToOpen, loading]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = courses.findIndex((c) => c.id === active.id);
    const newIndex = courses.findIndex((c) => c.id === over.id);

    const previousCours = [...courses];
    const newCours = arrayMove(courses, oldIndex, newIndex);
    setCourses(newCours);

    if (reorderCourse) {
      try {
        const success = await reorderCourse(newCours.map((c) => c.id));
        if (!success) {
          setCourses(previousCours);
        }
      } catch (err) {
        console.error("Error reordering courses:", err);
        setCourses(previousCours);
      }
    }
  };

  const handleRenameCourse = async (courseId: string, newTitle: string) => {
    const courseToUpdate = courses.find((c) => c.id === courseId);
    if (!courseToUpdate) return;

    const updated = await updateCourse(
      courseId,
      newTitle,
      courseToUpdate.description,
      courseToUpdate.contentText
    );

    if (updated) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? updated : c))
      );
    }
  };

  const handleCourseCreated = (newCours: Course) => {
    setCourses((prev) => [newCours, ...prev]);
    setSelectedCourse(newCours);
  };

  const handleCourseUpdated = (updatedCours: Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCours.id ? updatedCours : c))
    );
    if (selectedCourse?.id === updatedCours.id) {
      setSelectedCourse(updatedCours);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteCourse = (coursToRemove: Course) => {
    setCourseToDelete(coursToRemove);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!coursToDelete || !deleteCourse) return;
    setIsDeleting(true);
    const success = await deleteCourse(coursToDelete.id);
    if (success) {
      setCourses((prev) => prev.filter((c) => c.id !== coursToDelete.id));
      if (selectedCourse?.id === coursToDelete.id) {
        setSelectedCourse(null);
      }
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div data-testid="course-list-container">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course existants ({courses.length})
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
        ) : courses.length === 0 ? (
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
              items={courses.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {courses.map((c) => (
                  <SortableCourseItem
                    key={c.id}
                    course={c}
                    onSelect={setSelectedCourse}
                    onRename={handleRenameCourse}
                    onDelete={deleteCourse ? handleDeleteCourse : undefined}
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

      {selectedCourse && (
        <CourseTesterModal
          course={selectedCourse}
          allCourses={courses}
          sessionName={session.name}
          open={!!selectedCourse}
          onOpenChange={(open) => !open && setSelectedCourse(null)}
          updateCourse={updateCourse}
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
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent data-testid="modal-delete-course">
          <DialogHeader>
            <DialogTitle className="text-destructive">Supprimer le cours ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les questions, fichiers PDF et statistiques associés au cours "{coursToDelete?.title}" seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteModalOpen(false);
                setCourseToDelete(null);
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
