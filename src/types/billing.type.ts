import { Users } from "lucide-react";

export interface Plan {
    id: string;
    name: string;
    icon: typeof Users;
    monthlyPrice: number;
    description: string;
    classes: number;
    features: PlanFeature[];
    priceMonthlyId: string;
    priceAnnualId: string;
    gradient: string;
    darkGradient: string;
    iconBg: string;
    accentColor: string;
    popular: boolean;
}

export interface PlanFeature {
    text: string;
    highlight: boolean;
}