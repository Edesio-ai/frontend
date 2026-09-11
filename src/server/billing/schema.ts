import z from "zod";
import { locales } from "@/lib/i18n/config";

export const getStripeUrlSchema = z.object({
  priceId: z.string().min(1),
  planType: z.string().min(1),
  locale: z.enum(Object.values(locales)),
});

export type GetStripeUrlInput = z.infer<typeof getStripeUrlSchema>;
