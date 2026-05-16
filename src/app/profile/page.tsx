"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  CreditCard, 
  Mail, 
  Save,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profile.service";
import { BillingService } from "@/services/billing.service";
import { Subscription } from "@/types";
import { formatDate } from "@/utils/functions/date.utils";
import { CancelSubscriptionModal } from "@/components/profile/CancelSubscriptionModal";

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const profileSchema = z.object({
  firstname: z.string().min(1, "Le prénom est requis"),
  lastname: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


function PaymentMethodForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiFetch<{ clientSecret: string }>("/api/stripe/create-setup-intent", { method: "POST" });
      const { clientSecret } = response;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.payment_method) {
        await apiFetch<void>("/api/stripe/update-payment-method", { method: "POST", body: JSON.stringify({ paymentMethodId: setupIntent.payment_method }) });

        toast({
          title: "Moyen de paiement mis à jour",
          description: "Votre carte a été enregistrée avec succès.",
        });

        onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le moyen de paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-payment-method">
      <div className="p-4 border rounded-lg bg-background" data-testid="container-card-element">
        <CardElement options={cardElementOptions} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!stripe || isProcessing} data-testid="button-save-card">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            "Enregistrer la carte"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing} data-testid="button-cancel-card-form">
          Annuler
        </Button>
      </div>
    </form>
  );
}

function SubscriptionSection() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

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
      const response = await apiFetch<void>("/api/stripe/reactivate-subscription", { method: "POST" });

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

          {subscription.last4 && (
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Moyen de paiement</p>
                  <p className="font-medium flex items-center gap-2" data-testid="text-payment-method">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {getCardBrandDisplay(subscription.cardBrand)} **** {subscription.last4}
                  </p>
                </div>
                {!showCardForm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCardForm(true)}
                    data-testid="button-change-card"
                  >
                    Modifier
                  </Button>
                )}
              </div>

              {showCardForm && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Nouvelle carte bancaire</p>
                  <Elements stripe={stripePromise}>
                    <PaymentMethodForm 
                      onSuccess={() => {
                        setShowCardForm(false);
                        fetchSubscription();
                      }}
                      onCancel={() => setShowCardForm(false)}
                    />
                  </Elements>
                </div>
              )}
            </div>
          )}

          {!subscription.last4 && !showCardForm && (
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-3">Aucun moyen de paiement enregistré</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCardForm(true)}
                data-testid="button-add-card"
              >
                Ajouter une carte
              </Button>

              {showCardForm && (
                <div className="mt-4 pt-4 border-t">
                  <Elements stripe={stripePromise}>
                    <PaymentMethodForm 
                      onSuccess={() => {
                        setShowCardForm(false);
                        fetchSubscription();
                      }}
                      onCancel={() => setShowCardForm(false)}
                    />
                  </Elements>
                </div>
              )}
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

export default function Profile() {
  const { user, loading: authLoading, getUserRole } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
    },
  });

  const role = getUserRole();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      form.reset({
        firstname: user.metadata?.firstname || user.metadata?.firstname || "",
        lastname: user.metadata?.lastname || user.metadata?.lastname || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const getDashboardLink = () => {
    switch (role) {
      case "teacher":
        return "/teacher";
      case "student":
        return "/student";
      case "standalone":
        return "/standalone";
      case "establishment":
        return "/establishment";
      default:
        return "/";
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await profileService.updateProfile(data);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showSubscriptionSection = role !== "student";

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={getDashboardLink()}>
          <Button variant="ghost" className="mb-8" data-testid="button-back-dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-profile-title">
            Mon profil
          </h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et votre abonnement
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Informations personnelles</h2>
                <p className="text-sm text-muted-foreground">Modifiez vos coordonnées</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jean"
                            {...field}
                            data-testid="input-profile-firstname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dupont"
                            {...field}
                            data-testid="input-profile-lastname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse e-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          data-testid="input-profile-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                  data-testid="button-save-profile"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>

          {showSubscriptionSection && <SubscriptionSection />}
        </div>
      </div>
    </div>
  );
}
