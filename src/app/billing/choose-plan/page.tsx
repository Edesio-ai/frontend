"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Info, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { annualDiscountPercent, plans } from "@/utils/constants/billing";
import { PlanCard } from "@/components/billing/PlanCard";

export default function ChoisirPlan() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user, getUserRole } = useAuth();
  const searchParams = useSearchParams();
  const recommendedPlan = searchParams.get("plan");
  const userRole = getUserRole();

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
                -{annualDiscountPercent}%
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
            <PlanCard key={plan.id} plan={plan} recommendedPlan={recommendedPlan ?? ""} isAnnual={isAnnual} />
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
