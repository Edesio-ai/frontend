import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertTriangle, CreditCard, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BillingService } from "@/services/billing.service";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
  isPending?: boolean;
  role?: string;
}

interface SubscriptionBlockModalProps {
  children: React.ReactNode;
}

const planConfig: Record<string, { name: string; priceId: string; monthlyLink: string; yearlyLink: string }> = {
  autonome: {
    name: "Edesio Solo",
    priceId: "solo",
    monthlyLink: "https://buy.stripe.com/28EbJ1gNYcKu6FZ7VG1B600",
    yearlyLink: "https://buy.stripe.com/fZu8wP1T4cKu3tN8ZK1B601",
  },
  professeur: {
    name: "Edesio Professeur",
    priceId: "professeur",
    monthlyLink: "https://buy.stripe.com/7sY5kDcxI5i21lF1xi1B606",
    yearlyLink: "https://buy.stripe.com/cNieVdcxIh0K2pJ5Ny1B607",
  },
  etablissement: {
    name: "Edesio Établissement",
    priceId: "etablissement",
    monthlyLink: "https://buy.stripe.com/28E6oHapA7qa9Sb6RC1B604",
    yearlyLink: "https://buy.stripe.com/6oUeVdeFQfWG5BVcbW1B605",
  },
};

export function SubscriptionBlockModal({ children }: SubscriptionBlockModalProps) {
  const { user, loading: authLoading, getUserRole, logout } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleOpenPortal = async () => {
    if (user) return;
    // setIsOpeningPortal(true);
    // try {
    //   const response = await fetch("/api/stripe/create-portal-session", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${session.access_token}`,
    //     },
    //   });
    //   const data = await response.json();
    //   if (data.url) {
    //     window.location.href = data.url;
    //   }
    // } catch (err) {
    //   console.error("Error opening portal:", err);
    // } finally {
    //   setIsOpeningPortal(false);
    // }
  };

  const role = getUserRole();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (role === "student") {
        setSubscriptionStatus({ hasActiveSubscription: true, role: "eleve" });
        setIsLoading(false);
        return;
      }

      try {
        const data = await BillingService.getSubscriptionStatus();
        setSubscriptionStatus(data);
      } catch (err) {
        setError("Impossible de vérifier le statut de l'abonnement");
      } finally {
        setIsLoading(false);

      }
    };

    if (!authLoading) {
      checkSubscription();
    }
  }, [user, authLoading, role]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's an active subscription, show the children
  if (subscriptionStatus?.hasActiveSubscription) {
    return <>{children}</>;
  }

  // Get the plan config for this role
  const currentPlan = role ? planConfig[role] : null;

  // Block modal for inactive subscription
  return (
    <div className="min-h-screen bg-background">
      {/* Blurred background content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>

      {/* Blocking overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold" data-testid="text-subscription-blocked-title">
              {subscriptionStatus?.isPending
                ? "Paiement en attente"
                : subscriptionStatus?.status
                  ? "Abonnement inactif"
                  : "Abonnement requis"}
            </h2>
            <p className="text-muted-foreground" data-testid="text-subscription-blocked-description">
              {subscriptionStatus?.isPending
                ? "Votre paiement est en cours de traitement ou nécessite une action de votre part. Si vous venez de vous abonner, veuillez patienter quelques instants puis rafraîchir la page."
                : subscriptionStatus?.status
                  ? "Votre abonnement n'est plus actif. Pour accéder à votre tableau de bord et à toutes les fonctionnalités d'Edesio, veuillez réactiver votre abonnement."
                  : "Pour accéder à votre tableau de bord et à toutes les fonctionnalités d'Edesio, veuillez activer votre abonnement."}
            </p>
          </div>

          {subscriptionStatus?.isPending && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Si le problème persiste, vérifiez que votre banque n'a pas bloqué le paiement ou contactez-nous.
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleOpenPortal}
                disabled={isOpeningPortal}
                data-testid="button-manage-payment"
              >
                {isOpeningPortal ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Gérer mon paiement
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => window.location.reload()}
                data-testid="button-refresh-subscription"
              >
                Rafraîchir la page
              </Button>
            </div>
          )}

          {!subscriptionStatus?.isPending && currentPlan && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{currentPlan.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus?.status
                    ? "Réactivez votre abonnement pour reprendre l'activité sur votre compte."
                    : "Activez votre abonnement pour commencer à utiliser Edesio."}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`${currentPlan.monthlyLink}?prefilled_email=${encodeURIComponent(user?.email || "")}&client_reference_id=${encodeURIComponent(user?.id || "")}`}
                  className="block"
                  data-testid="link-subscribe-monthly"
                >
                  <Button className="w-full" size="lg" data-testid="button-subscribe-monthly">
                    S'abonner mensuellement
                  </Button>
                </a>
                <a
                  href={`${currentPlan.yearlyLink}?prefilled_email=${encodeURIComponent(user?.email || "")}&client_reference_id=${encodeURIComponent(user?.id || "")}`}
                  className="block"
                  data-testid="link-subscribe-yearly"
                >
                  <Button variant="outline" className="w-full" size="lg" data-testid="button-subscribe-yearly">
                    S'abonner annuellement (-15%)
                  </Button>
                </a>
              </div>
            </div>
          )}

          {!currentPlan && (
            <div className="space-y-4">
              <Link href={`/billing/choose-plan?plan=${role}`}>
                <Button className="w-full" size="lg" data-testid="button-choose-plan">
                  Choisir un abonnement
                </Button>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t space-y-3">
            <p className="text-xs text-center text-muted-foreground">
              Besoin d'aide ? Contactez-nous à{" "}
              <a href="mailto:contact@edesio.ai" className="text-primary hover:underline" data-testid="link-contact-support">
                contact@edesio.ai
              </a>
            </p>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={async () => {
                await logout();
                window.location.href = "/";
              }}
              data-testid="button-logout-from-modal"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
