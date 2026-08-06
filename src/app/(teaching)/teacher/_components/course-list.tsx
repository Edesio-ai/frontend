"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";

import type { Session, Course } from "@/types";
import { Plus, Loader2, FileText, BookOpen } from "lucide-react";
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
import { AddCourseModal } from "./add-course-modal";
import { DeleteCourseModal } from "./delete-course-modal";
import { useTeacher } from "@/app/(teaching)/teacher/_contexts/teacher-context";
import { CourseTesterModal } from "./course-tester-modal";
import { SortableCourseItem } from "./sortable-course-item";

interface CourseListProps {
  session: Session;
  initialCoursToOpen?: Course | null;
  onInitialCoursOpened?: () => void;
}

export function CourseList({ session, initialCoursToOpen, onInitialCoursOpened }: CourseListProps) {
  const t = useTranslations();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCourse, setselectedCourse] = useState<Course | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { fetchCourses, createCourse, updateCourse, deleteCourse, reorderCourse } = useTeacher();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadCourse = useCallback(async () => {
    setLoading(true);
    const data = await fetchCourses(session.id);
    setCourses(data);
    setLoading(false);
  }, [fetchCourses, session.id]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (initialCoursToOpen && !loading) {
      setselectedCourse(initialCoursToOpen);
      if (onInitialCoursOpened) {
        onInitialCoursOpened();
      }
    }
  }, [initialCoursToOpen, loading, onInitialCoursOpened]);

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

    const updated = await updateCourse(courseId, newTitle, courseToUpdate.description, courseToUpdate.contentText);

    if (updated) {
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
    }
  };

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setselectedCourse(newCourse);
  };

  const handleCourseUpdated = (updatedCours: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCours.id ? updatedCours : c)));
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
            {t.teacher.courseList.addCourse} ({courses.length})
          </h4>
          <Button onClick={() => setAddModalOpen(true)} data-testid="button-open-add-course">
            <Plus className="h-4 w-4 mr-2" />
            {t.teacher.courseList.addCourse}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{t.teacher.courseList.empty}</p>
            <p className="text-sm mt-1">{t.teacher.courseList.emptyHint}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {courses.map((c) => (
                  <SortableCourseItem
                    key={c.id}
                    course={c}
                    onSelect={setselectedCourse}
                    onRename={handleRenameCourse}
                    onDelete={handleDeleteCourse}
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
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      <DeleteCourseModal
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        setCourseToDelete={setCourseToDelete}
        isDeleting={isDeleting}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
