import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { AlertDialogHeader } from "../ui/alert-dialog";

type DeleteQuestionModalProps = {
    deleteConfirmOpen: boolean;
    setDeleteConfirmOpen: (open: boolean) => void;
    isDeleting: boolean;
    handleDelete: () => void;
}

export function DeleteQuestionModal({ deleteConfirmOpen, setDeleteConfirmOpen, isDeleting, handleDelete }: DeleteQuestionModalProps) {
    return (
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. La question sera définitivement supprimée.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}