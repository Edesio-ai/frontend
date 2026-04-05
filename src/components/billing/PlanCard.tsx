import { Plan } from "@/types";
import { useState } from "react";
import { Check, Loader } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { annualDiscountPercent } from "@/utils/constants/billing";
import { BillingService } from "@/services/billing.service";
import { useRouter } from "next/navigation";

type PlanCardProps = {

    plan: Plan;
    recommendedPlan: string;
    isAnnual: boolean;
}

export function PlanCard({ plan, recommendedPlan, isAnnual }: PlanCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const formatPrice = (price: number) => {
        return price.toFixed(2).replace(".", ",") + "€";
    };

    const getPrice = (monthlyPrice: number) => {
        if (isAnnual) {
            return monthlyPrice * (1 - annualDiscountPercent / 100);
        }
        return monthlyPrice;
    };

    const handleSubscribe = async (plan: Plan) => {
        setIsLoading(true);
        const priceId = isAnnual ? plan.priceAnnualId : plan.priceMonthlyId;
        const planType = plan.id;
        const { url } = await BillingService.getStripeUrl(priceId, planType);
        router.push(url);
        setIsLoading(false);
    };

    return (

        <Card
            key={plan.id}
            id={`plan-${plan.id}`}
            className={`relative p-6 flex flex-col overflow-hidden transition-all duration-300 border-none ${recommendedPlan === plan.id
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
                    <button
                        onClick={() => handleSubscribe(plan)}
                        data-testid={`button-plan-${plan.id}-subscribe`}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "S'abonner"}
                    </button>
                </Button>
            </div>
        </Card>
    )
}