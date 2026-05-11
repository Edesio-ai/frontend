import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { Course } from "@/types";

interface DeleteCourseModalProps {
    deleteModalOpen: boolean;
    setDeleteModalOpen: (open: boolean) => void;
    setCourseToDelete: (course: Course | null) => void;
    courseToDelete: Course | null;
    isDeleting: boolean;
    handleConfirmDelete: () => void;
}

export function DeleteCourseModal({
    deleteModalOpen,
    setDeleteModalOpen,
    setCourseToDelete,
    courseToDelete,
    isDeleting,
    handleConfirmDelete,
}: DeleteCourseModalProps) {
    return (
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent data-testid="modal-delete-course">
            <DialogHeader>
                <DialogTitle className="text-destructive">Supprimer le cours ?</DialogTitle>
                <DialogDescription>
                    Cette action est irréversible. Toutes les questions, fichiers PDF et statistiques associés au cours "{courseToDelete?.title}" seront définitivement supprimés.
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
    )
}
