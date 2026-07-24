import { Users } from "lucide-react";
import type { Subscription } from "./profile.type";

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

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
  isPending?: boolean;
  role?: string;
}

export interface CheckoutUrlResponse {
  url: string;
}

export interface SubscriptionResponse {
  subscription: Subscription;
}
