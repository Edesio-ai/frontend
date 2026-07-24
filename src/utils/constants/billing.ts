import { User, Users, Building2 } from "lucide-react";
import { Plan } from "@/types";
import type { Locale } from "@/lib/i18n/config";

type StripeLang = "FR" | "EN";

function stripeLang(locale: Locale): StripeLang {
  return locale === "en" ? "EN" : "FR";
}

/**
 * Next.js only inlines NEXT_PUBLIC_* when accessed with a static literal.
 * Do not use process.env[`KEY_${var}`] — it is always empty on the client.
 */
const STRIPE_PRICE_IDS = {
  STANDALONE: {
    FR: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDALONE_FR ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDALONE_ANNUAL_FR ?? "",
    },
    EN: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDALONE_EN ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDALONE_ANNUAL_EN ?? "",
    },
  },
  TEACHER: {
    FR: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEACHER_FR ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEACHER_ANNUAL_FR ?? "",
    },
    EN: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEACHER_EN ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEACHER_ANNUAL_EN ?? "",
    },
  },
  ESTABLISHMENT: {
    FR: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESTABLISHMENT_FR ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESTABLISHMENT_ANNUAL_FR ?? "",
    },
    EN: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESTABLISHMENT_EN ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESTABLISHMENT_ANNUAL_EN ?? "",
    },
  },
} as const;

const planPriceKey: Record<Plan["id"], keyof typeof STRIPE_PRICE_IDS> = {
  "self-learner": "STANDALONE",
  teacher: "TEACHER",
  establishment: "ESTABLISHMENT",
};

const planBases: Omit<Plan, "priceMonthlyId" | "priceAnnualId">[] = [
  {
    id: "self-learner",
    name: "Edesio Solo",
    icon: User,
    monthlyPrice: 4.9,
    description: "For individual learners and self-taught students.",
    classes: 1,
    features: [
      { text: "1 class included", highlight: true },
      { text: "Up to 50 lessons", highlight: false },
      { text: "AI question generation", highlight: false },
      { text: "Personal AI chatbot", highlight: false },
      { text: "Progress tracking", highlight: false },
      { text: "Mobile app", highlight: false },
    ],
    gradient: "from-yellow-50 to-amber-50",
    darkGradient: "dark:from-yellow-900/20 dark:to-amber-900/20",
    iconBg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    accentColor: "text-yellow-600 dark:text-yellow-400",
    popular: false,
  },
  {
    id: "teacher",
    name: "Edesio Teacher",
    icon: Users,
    monthlyPrice: 24.9,
    description: "For a teacher with multiple classes.",
    classes: 10,
    features: [
      { text: "10 classes included", highlight: true },
      { text: "Up to 50 lessons per class", highlight: false },
      { text: "Unlimited students", highlight: false },
      { text: "Detailed statistics", highlight: false },
      { text: "Mobile app", highlight: false },
    ],
    gradient: "from-indigo-50 to-purple-50",
    darkGradient: "dark:from-indigo-900/20 dark:to-purple-900/20",
    iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    popular: false,
  },
  {
    id: "establishment",
    name: "Edesio Institution",
    icon: Building2,
    monthlyPrice: 299.9,
    description: "Cover your entire institution.",
    classes: 150,
    features: [
      { text: "150 classes included", highlight: true },
      { text: "Up to 50 lessons per class", highlight: false },
      { text: "Unlimited teachers", highlight: false },
      { text: "Unlimited students", highlight: false },
      { text: "Priority support", highlight: false },
      { text: "Institution statistics", highlight: false },
      { text: "Mobile app", highlight: false },
    ],
    gradient: "from-emerald-50 to-green-50",
    darkGradient: "dark:from-emerald-900/20 dark:to-green-900/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    popular: true,
  },
];

/** Plans with Stripe price IDs matching the UI locale (FR / EN). */
export function getPlans(locale: Locale): Plan[] {
  const lang = stripeLang(locale);

  return planBases.map((plan) => {
    const prices = STRIPE_PRICE_IDS[planPriceKey[plan.id]][lang];
    return {
      ...plan,
      priceMonthlyId: prices.monthly,
      priceAnnualId: prices.annual,
    };
  });
}

/** @deprecated Prefer getPlans(locale) so Stripe IDs follow the active language. */
export const plans: Plan[] = getPlans("fr");

export const annualDiscountPercent = 15;
