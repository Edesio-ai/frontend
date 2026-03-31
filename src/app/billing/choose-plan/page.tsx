"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Users, Building2, User, Info, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

interface PlanFeature {
  text: string;
  highlight: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: typeof Users;
  monthlyPrice: number;
  description: string;
  classes: number;
  features: PlanFeature[];
  stripeMonthlyLink: string;
  stripeAnnualLink: string;
  gradient: string;
  darkGradient: string;
  iconBg: string;
  accentColor: string;
  popular: boolean;
}

const plans: Plan[] = [
  {
    id: "standalone",
    name: "Edesio Solo",
    icon: User,
    monthlyPrice: 4.90,
    description: "Pour les apprenants individuels et autodidactes.",
    classes: 1,
    features: [
      { text: "1 classe incluse", highlight: true },
      { text: "Jusqu'à 50 cours", highlight: false },
      { text: "Génération de questions IA", highlight: false },
      { text: "Chatbot IA personnel", highlight: false },
      { text: "Suivi de progression", highlight: false },
      { text: "Application mobile", highlight: false },
    ],
    stripeMonthlyLink: "https://buy.stripe.com/28EbJ1gNYcKu6FZ7VG1B600",
    stripeAnnualLink: "https://buy.stripe.com/fZu8wP1T4cKu3tN8ZK1B601",
    gradient: "from-yellow-50 to-amber-50",
    darkGradient: "dark:from-yellow-900/20 dark:to-amber-900/20",
    iconBg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    accentColor: "text-yellow-600 dark:text-yellow-400",
    popular: false,
  },
  {
    id: "teacher",
    name: "Edesio Professeur",
    icon: Users,
    monthlyPrice: 24.90,
    description: "Pour un professeur avec plusieurs classes.",
    classes: 10,
    features: [
      { text: "10 classes incluses", highlight: true },
      { text: "Jusqu'à 50 cours par classe", highlight: false },
      { text: "Élèves illimités", highlight: false },
      { text: "Statistiques détaillées", highlight: false },
      { text: "Application mobile", highlight: false },
    ],
    stripeMonthlyLink: "https://buy.stripe.com/7sY5kDcxI5i21lF1xi1B606",
    stripeAnnualLink: "https://buy.stripe.com/cNieVdcxIh0K2pJ5Ny1B607",
    gradient: "from-indigo-50 to-purple-50",
    darkGradient: "dark:from-indigo-900/20 dark:to-purple-900/20",
    iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    popular: false,
  },
  {
    id: "establishment",
    name: "Edesio Établissement",
    icon: Building2,
    monthlyPrice: 299.90,
    description: "Couvrez l'ensemble de votre établissement.",
    classes: 150,
    features: [
      { text: "150 classes incluses", highlight: true },
      { text: "Jusqu'à 50 cours par classe", highlight: false },
      { text: "Professeurs illimités", highlight: false },
      { text: "Élèves illimités", highlight: false },
      { text: "Support prioritaire", highlight: false },
      { text: "Statistiques établissement", highlight: false },
      { text: "Application mobile", highlight: false },
    ],
    stripeMonthlyLink: "https://buy.stripe.com/28E6oHapA7qa9Sb6RC1B604",
    stripeAnnualLink: "https://buy.stripe.com/6oUeVdeFQfWG5BVcbW1B605",
    gradient: "from-emerald-50 to-green-50",
    darkGradient: "dark:from-emerald-900/20 dark:to-green-900/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    popular: true,
  },
];

export default function ChoisirPlan() {
  const [isAnnual, setIsAnnual] = useState(false);
  const discountPercent = 15;
  const { user, getUserRole } = useAuth();
  const searchParams = useSearchParams();
  const recommendedPlan = searchParams.get("plan");
  const userRole = getUserRole();
  console.log("🚀 ~ ChoisirPlan ~ userRole:", userRole)

  // Map user role to plan id
  const roleToPlanId: Record<string, string> = {
    standalone: "standalone",
    teacher: "teacher",
    establishment: "establishment",
  };

  // Filter plans based on user role - only show the relevant plan
  const filteredPlans = userRole && roleToPlanId[userRole]
    ? plans.filter(plan => plan.id === roleToPlanId[userRole])
    : plans; // Show all plans if no role (fallback for landing page visitors)

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      return monthlyPrice * (1 - discountPercent / 100);
    }
    return monthlyPrice;
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + "€";
  };

  const getStripeLink = (plan: Plan) => {
    const baseLink = isAnnual ? plan.stripeAnnualLink : plan.stripeMonthlyLink;
    if (user?.email) {
      return `${baseLink}?prefilled_email=${encodeURIComponent(user.email)}`;
    }
    return baseLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6" data-testid="link-home">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white" data-testid="text-choose-plan-title">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto mb-6">
            {filteredPlans.length === 1 
              ? `Activez votre abonnement ${filteredPlans[0].name} pour accéder à toutes les fonctionnalités.`
              : "Votre compte a été créé avec succès. Choisissez le plan qui correspond à vos besoins."
            }
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-white" : "text-slate-400"}`}>
              Mensuel
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              data-testid="switch-billing-period"
              className="data-[state=checked]:bg-amber-500"
            />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-white" : "text-slate-400"}`}>
              Annuel
            </span>
            {isAnnual && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-none text-white text-xs">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Bot className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-slate-200">
              1 classe = 1 module pédagogique complet avec IA
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-0.5 hover:bg-white/10 rounded-full transition-colors" data-testid="button-classe-info">
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-left">
                <p className="font-medium mb-1">Qu'est-ce qu'une classe ?</p>
                <p className="text-xs text-muted-foreground">
                  Une classe correspond à un module pédagogique complet : multi-cours autorisés, test complet intégré, et nombre d'élèves illimité.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className={`grid gap-5 ${filteredPlans.length === 1 ? 'max-w-md mx-auto' : filteredPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              id={`plan-${plan.id}`}
              className={`relative p-6 flex flex-col overflow-hidden transition-all duration-300 border-none ${
                recommendedPlan === plan.id
                  ? "shadow-2xl shadow-primary/30 ring-2 ring-primary md:-translate-y-2"
                  : plan.popular
                    ? "shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500/50 md:-translate-y-2"
                    : "shadow-xl hover:shadow-2xl hover:-translate-y-1"
              } bg-gradient-to-br ${plan.gradient} ${plan.darkGradient}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {recommendedPlan === plan.id && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold px-3 py-1 rounded-bl-lg" data-testid={`badge-recommended-${plan.id}`}>
                    Recommandé
                  </div>
                </div>
              )}
              {plan.popular && recommendedPlan !== plan.id && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Populaire
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-5">
                  <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center shadow-lg mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1" data-testid={`text-plan-${plan.id}-name`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${plan.accentColor}`} data-testid={`text-plan-${plan.id}-price`}>
                      {formatPrice(getPrice(plan.monthlyPrice))}
                    </span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`text-plan-${plan.id}-annual`}>
                      soit {formatPrice(getPrice(plan.monthlyPrice) * 12)}/an
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full ${feature.highlight ? plan.iconBg : "bg-emerald-500/20"} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Check className={`h-2.5 w-2.5 ${feature.highlight ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                      </div>
                      <span className="text-sm">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 text-white" : ""}`}
                  variant={plan.popular ? "default" : "secondary"}
                  asChild
                >
                  <a 
                    href={getStripeLink(plan)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid={`button-plan-${plan.id}-subscribe`}
                  >
                    S'abonner
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">Résiliation facile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
