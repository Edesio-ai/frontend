"use client";

import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { AlertDialogHeader } from "../ui/alert-dialog";
import { useTranslations } from "@/lib/i18n/client";

type DeleteQuestionModalProps = {
    deleteConfirmOpen: boolean;
    setDeleteConfirmOpen: (open: boolean) => void;
    isDeleting: boolean;
    handleDelete: () => void;
}

export function DeleteQuestionModal({ deleteConfirmOpen, setDeleteConfirmOpen, isDeleting, handleDelete }: DeleteQuestionModalProps) {
    const t = useTranslations();
    return (
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.teacher.deleteQuestionModal.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t.teacher.deleteQuestionModal.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t.teacher.deleteQuestionModal.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t.teacher.deleteQuestionModal.confirm}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
