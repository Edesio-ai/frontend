export const SUBSCRIPTION_PLAN_CONFIG: Record<
  string,
  { planKey: "self-learner" | "teacher" | "establishment"; priceId: string; monthlyLink: string; yearlyLink: string }
> = {
  "self-learner": {
    planKey: "self-learner",
    priceId: "solo",
    monthlyLink: "https://buy.stripe.com/28EbJ1gNYcKu6FZ7VG1B600",
    yearlyLink: "https://buy.stripe.com/fZu8wP1T4cKu3tN8ZK1B601",
  },
  autonome: {
    planKey: "self-learner",
    priceId: "solo",
    monthlyLink: "https://buy.stripe.com/28EbJ1gNYcKu6FZ7VG1B600",
    yearlyLink: "https://buy.stripe.com/fZu8wP1T4cKu3tN8ZK1B601",
  },
  teacher: {
    planKey: "teacher",
    priceId: "professeur",
    monthlyLink: "https://buy.stripe.com/7sY5kDcxI5i21lF1xi1B606",
    yearlyLink: "https://buy.stripe.com/cNieVdcxIh0K2pJ5Ny1B607",
  },
  professeur: {
    planKey: "teacher",
    priceId: "professeur",
    monthlyLink: "https://buy.stripe.com/7sY5kDcxI5i21lF1xi1B606",
    yearlyLink: "https://buy.stripe.com/cNieVdcxIh0K2pJ5Ny1B607",
  },
  establishment: {
    planKey: "establishment",
    priceId: "etablissement",
    monthlyLink: "https://buy.stripe.com/28E6oHapA7qa9Sb6RC1B604",
    yearlyLink: "https://buy.stripe.com/6oUeVdeFQfWG5BVcbW1B605",
  },
  etablissement: {
    planKey: "establishment",
    priceId: "etablissement",
    monthlyLink: "https://buy.stripe.com/28E6oHapA7qa9Sb6RC1B604",
    yearlyLink: "https://buy.stripe.com/6oUeVdeFQfWG5BVcbW1B605",
  },
};
