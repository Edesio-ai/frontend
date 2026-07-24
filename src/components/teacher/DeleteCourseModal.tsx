"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { Course } from "@/types";
import { useTranslations } from "@/lib/i18n/client";

interface DeleteCourseModalProps {
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  setCourseToDelete: (course: Course | null) => void;
  isDeleting: boolean;
  handleConfirmDelete: () => void;
}

export function DeleteCourseModal({
  deleteModalOpen,
  setDeleteModalOpen,
  setCourseToDelete,
  isDeleting,
  handleConfirmDelete,
}: DeleteCourseModalProps) {
  const t = useTranslations();
  return (
    <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent data-testid="modal-delete-course">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t.teacher.deleteCourseModal.title}</DialogTitle>
          <DialogDescription>{t.teacher.deleteCourseModal.description}</DialogDescription>
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
            {t.teacher.deleteCourseModal.cancel}
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
                {t.teacher.deleteCourseModal.confirm}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
