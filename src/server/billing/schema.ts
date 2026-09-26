import z from "zod";
import { BACKEND_LOCALES } from "@/lib/i18n/config";

export const getStripeUrlSchema = z.object({
  priceId: z.string().min(1),
  planType: z.string().min(1),
  locale: z.enum(BACKEND_LOCALES),
});

export type GetStripeUrlInput = z.infer<typeof getStripeUrlSchema>;
