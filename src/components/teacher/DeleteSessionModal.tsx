"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useTranslations } from "@/lib/i18n/client";

interface DeleteSessionModalProps {
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  isDeleting: boolean;
  handleConfirmDelete: () => void;
}

export function DeleteSessionModal({
  deleteModalOpen,
  setDeleteModalOpen,
  isDeleting,
  handleConfirmDelete,
}: DeleteSessionModalProps) {
  const t = useTranslations();
  return (
    <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent data-testid="modal-delete-session">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t.teacher.deleteSessionModal.title}</DialogTitle>
          <DialogDescription>{t.teacher.deleteSessionModal.description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isDeleting}
            data-testid="button-cancel-delete"
          >
            {t.teacher.deleteSessionModal.cancel}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            data-testid="button-confirm-delete"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t.teacher.deleteSessionModal.confirm}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
