import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { AlertDialogDescription } from "../ui/alert-dialog";
import { Subscription } from "@/types/";
import { formatDate } from "@/utils/functions/date.utils";

export interface CancelSubscriptionModalProps {
    showCancelDialog: boolean;
    setShowCancelDialog: (showCancelDialog: boolean) => void;
    subscription: Subscription;
    handleCancelSubscription: () => void;
    isCanceling: boolean;
}

export function CancelSubscriptionModal({ showCancelDialog, setShowCancelDialog, subscription, handleCancelSubscription, isCanceling }: CancelSubscriptionModalProps) {
    return (
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Annuler votre abonnement ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Votre abonnement sera résilié à la fin de la période de facturation en cours
                        (le {formatDate(subscription.currentPeriodEnd)}). Vous conserverez l'accès à
                        toutes les fonctionnalités jusqu'à cette date.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Garder mon abonnement</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isCanceling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Annulation...
                            </>
                        ) : (
                            "Confirmer l'annulation"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}