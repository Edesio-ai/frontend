import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Subscription } from "@/types";
import { BillingService } from "@/services/billing.service";
import { Badge } from "../ui/badge";
import { AlertTriangle, Calendar, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { CreditCard } from "lucide-react";
import { formatDate } from "@/utils/functions/date.utils";
import { Link } from "lucide-react";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";

export function SubscriptionSection() {
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
  
    const handleRedirecctToCustomerPortal = async () => {
      const { url } = await BillingService.getCustomerPortalUrl();
      window.location.href = url;
    };
  
    const fetchSubscription = async () => {
      try {
        const { subscription } = await BillingService.getSubscription();
        setSubscription(subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      fetchSubscription();
    }, []);
  
    const handleCancelSubscription = async () => {
      setIsCanceling(true);
      try {
        await BillingService.cancelSubscription();
  
        toast({
          title: "Abonnement annulé",
          description: "Votre abonnement sera résilié à la fin de la période en cours.",
        });
        fetchSubscription();
      } catch (error) {
        console.error("Error canceling subscription:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'annuler l'abonnement.",
          variant: "destructive",
        });
      } finally {
        setIsCanceling(false);
        setShowCancelDialog(false);
      }
    };
  
    const handleReactivateSubscription = async () => {
      setIsReactivating(true);
      try {
        await BillingService.reactivateSubscription();
  
        toast({
          title: "Abonnement réactivé",
          description: "Votre abonnement a été réactivé avec succès.",
        });
        fetchSubscription();
      } catch (error) {
        console.error("Error reactivating subscription:", error);
        toast({
          title: "Erreur",
          description: "Impossible de réactiver l'abonnement.",
          variant: "destructive",
        });
      } finally {
        setIsReactivating(false);
      }
    };
  
    const formatAmount = (amount: number, currency: string) => {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    };
  
    const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
      if (cancelAtPeriodEnd) {
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Annulation programmée
          </Badge>
        );
      }
      switch (status) {
        case "active":
          return (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Actif
            </Badge>
          );
        case "past_due":
          return (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Paiement en retard
            </Badge>
          );
        case "canceled":
          return (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <XCircle className="h-3 w-3 mr-1" />
              Annulé
            </Badge>
          );
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    };
  
    const getCardBrandDisplay = (brand: string | null) => {
      const brandNames: Record<string, string> = {
        visa: "Visa",
        mastercard: "Mastercard",
        amex: "American Express",
        discover: "Discover",
        diners: "Diners Club",
        jcb: "JCB",
        unionpay: "UnionPay",
      };
      return brand ? brandNames[brand] || brand.charAt(0).toUpperCase() + brand.slice(1) : "Carte";
    };
  
    if (isLoading) {
      return (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </Card>
      );
    }
  
    if (!subscription || subscription.isEstablishmentSubscription) {
      return (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Abonnement</h2>
              <p className="text-sm text-muted-foreground">Gérez votre abonnement</p>
            </div>
          </div>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {subscription?.isEstablishmentSubscription ? "Vous êtes sous l'abonnement de votre établissement." : "Vous n'avez pas d'abonnement actif."}
            </p>
            {!subscription?.isEstablishmentSubscription && (
              <Link href="/choisir-plan">
                <Button>Choisir un forfait</Button>
              </Link>
            )}
          </div>
        </Card>
      );
    }
  
    return (
      <>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Abonnement</h2>
                <p className="text-sm text-muted-foreground">Gérez votre abonnement</p>
              </div>
            </div>
            <span data-testid="badge-subscription-status">{getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)}</span>
          </div>
  
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Forfait</p>
                <p className="font-semibold" data-testid="text-subscription-plan">{subscription.plan}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Montant</p>
                <p className="font-semibold" data-testid="text-subscription-amount">
                  {formatAmount(subscription.amount, subscription.currency)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{subscription.interval === "year" ? "an" : "mois"}
                  </span>
                </p>
              </div>
            </div>
  
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd ? "Fin d'accès le" : "Prochaine facturation"}
                </p>
              </div>
              <p className="font-semibold" data-testid="text-subscription-date">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
  
            {(subscription.last4 && !subscription.cancelAtPeriodEnd) && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Moyen de paiement</p>
                    <p className="font-medium flex items-center gap-2" data-testid="text-payment-method">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {getCardBrandDisplay(subscription.cardBrand)} **** {subscription.last4}
                    </p>
                  </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRedirecctToCustomerPortal()}
                      data-testid="button-change-card"
                    >
                      Modifier
                    </Button>
                </div>
              </div>
            )}
  
            {!subscription.last4 && (
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-3">Aucun moyen de paiement enregistré</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRedirecctToCustomerPortal()}
                  data-testid="button-add-card"
                >
                  Ajouter une carte
                </Button>
              </div>
            )}
  
            <div className="pt-4 border-t">
              {subscription.cancelAtPeriodEnd ? (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Votre abonnement sera résilié le {formatDate(subscription.currentPeriodEnd)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vous conservez l'accès jusqu'à cette date.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReactivateSubscription}
                    disabled={isReactivating}
                    data-testid="button-reactivate-subscription"
                  >
                    {isReactivating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Réactivation...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réactiver l'abonnement
                      </>
                    )}
                  </Button>
                </div>
              ) : subscription.status === "active" ? (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                  data-testid="button-cancel-subscription"
                >
                  Annuler l'abonnement
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
  
        <CancelSubscriptionModal
          showCancelDialog={showCancelDialog}
          setShowCancelDialog={setShowCancelDialog}
          subscription={subscription}
          handleCancelSubscription={handleCancelSubscription}
          isCanceling={isCanceling}
        />
      </>
    );
  }