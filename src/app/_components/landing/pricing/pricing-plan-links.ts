import { USER_ROLE } from "@/types";

export const PRICING_FOUNDERS_EMAIL = "edesio.founders@gmail.com";

export const PRICING_PLAN_REGISTER_ROLES = {
  solo: USER_ROLE.selfLearner,
  teacher: USER_ROLE.teacher,
  establishment: USER_ROLE.establishment,
} as const;

export function getPricingPlanHref(planId: string, quoteMailSubject: string): string {
  if (planId === "custom") {
    return `mailto:${PRICING_FOUNDERS_EMAIL}?subject=${encodeURIComponent(quoteMailSubject)}`;
  }

  const role = PRICING_PLAN_REGISTER_ROLES[planId as keyof typeof PRICING_PLAN_REGISTER_ROLES];
  if (!role) return "/register";

  return `/register?role=${role}`;
}
