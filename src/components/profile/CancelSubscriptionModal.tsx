"use client";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertDialogDescription } from "../ui/alert-dialog";
import { useTranslations } from "@/lib/i18n/client";

export interface CancelSubscriptionModalProps {
  showCancelDialog: boolean;
  setShowCancelDialog: (showCancelDialog: boolean) => void;
  handleCancelSubscription: () => void;
  isCanceling: boolean;
}

export function CancelSubscriptionModal({
  showCancelDialog,
  setShowCancelDialog,
  handleCancelSubscription,
  isCanceling,
}: CancelSubscriptionModalProps) {
  const t = useTranslations();
  return (
    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.billing.cancelModal.title}</AlertDialogTitle>
          <AlertDialogDescription>{t.billing.cancelModal.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.billing.cancelModal.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelSubscription}
            disabled={isCanceling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCanceling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.billing.subscriptionSection.cancelling}
              </>
            ) : (
              t.billing.cancelModal.confirm
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
