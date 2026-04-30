import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { CourseTesterModal } from "./CourseTesterModal";
import type {
  Session,
  Course,
  CourseFile,
  Question,
  CourseRanking,
  UpdateQuestionRequest,
} from "@/types";
import { 
  Plus, 
  Loader2, 
  FileText, 
  BookOpen, 
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
import { AddCourseModal } from "../teacher/AddCourseModal";
import { SortableCourseItem } from "../teacher/SortableCoursetem";
import { DeleteCourseModal } from "../teacher/DeleteCourseModal";

interface CourseListProps {
  session: Session;
  fetchCourses: (sessionId: string) => Promise<Course[]>;
  createCourse: (
    sessionId: string,
    title: string,
    description: string,
    contentText: string,
    pdfFiles?: File[]
  ) => Promise<Course | null>;
  updateCourse: (
    courseId: string,
    title: string,
    description: string | null,
    contenuTexte: string | null
  ) => Promise<Course | null>;
  deleteCourse?: (courseId: string) => Promise<boolean>;
  reorderCourse?: (coursIds: string[]) => Promise<boolean>;
  uploadPdfForCourse: (courseId: string, file: File) => Promise<CourseFile | null>;
  fetchCourseFiles: (courseId: string) => Promise<CourseFile[]>;
  deleteCourseFile: (fichier: CourseFile) => Promise<boolean>;
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
      type: "single" | "multiple" | "open";
      questionText: string;
      proposals?: string[];
      correctAnswers?: string[];
      explanation?: string;
    }
  ) => Promise<Question | null>;
  reorderQuestions?: (questionIds: string[]) => Promise<boolean>;
  generateQuestions: (
    courseId: string,
    config?: { totalQuestions?: number; qcmCount?: number; ouverteCount?: number }
  ) => Promise<{ success: boolean; questionsCreated?: number; error?: string }>;
  validateQuestions: (courseId: string) => Promise<{ success: boolean; cours?: Course; error?: string }>;
  fetchCourseRanking?: (courseId: string) => Promise<CourseRanking[]>;
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
  const [selectedCourse, setselectedCourse] = useState<Course | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
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
      setselectedCourse(initialCoursToOpen);
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

    const previousCourse = [...courses];
    const newCourse = arrayMove(courses, oldIndex, newIndex);
    setCourses(newCourse);

    if (reorderCourse) {
      try {
        const success = await reorderCourse(newCourse.map((c) => c.id));
        if (!success) {
          setCourses(previousCourse);
        }
      } catch (err) {
        console.error("Error reordering courses:", err);
        setCourses(previousCourse);
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

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setselectedCourse(newCourse);
  };

  const handleCourseUpdated = (updatedCours: Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCours.id ? updatedCours : c))
    );
    if (selectedCourse?.id === updatedCours.id) {
      setselectedCourse(updatedCours);
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
    if (!courseToDelete || !deleteCourse) return;
    setIsDeleting(true);
    const success = await deleteCourse(courseToDelete.id);
    if (success) {
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      if (selectedCourse?.id === courseToDelete.id) {
        setselectedCourse(null);
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
                    onSelect={setselectedCourse}
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
          onOpenChange={(open) => !open && setselectedCourse(null)}
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

      <DeleteCourseModal
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        setCourseToDelete={setCourseToDelete}
        courseToDelete={courseToDelete}
        isDeleting={isDeleting}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
