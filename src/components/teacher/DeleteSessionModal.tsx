import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Session } from "@/types";

interface DeleteSessionModalProps {
    deleteModalOpen: boolean;
    setDeleteModalOpen: (open: boolean) => void;
    session: Session;
    isDeleting: boolean;
    handleConfirmDelete: () => void;
}

export function DeleteSessionModal({
    deleteModalOpen,
    setDeleteModalOpen,
    session,
    isDeleting,
    handleConfirmDelete,
}: DeleteSessionModalProps) {
    return (
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent data-testid="modal-delete-session">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Supprimer la session ?</DialogTitle>
                    <DialogDescription>
                        Cette action est irréversible. Tous les cours, fichiers PDF et questions associés à la session "{session.name}" seront définitivement supprimés.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDeleteModalOpen(false)}
                        disabled={isDeleting}
                        data-testid="button-cancel-delete"
                    >
                        Annuler
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
                                Supprimer
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}