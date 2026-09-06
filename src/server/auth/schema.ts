import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" || iss.input == null ? "emailRequired" : "emailInvalid"),
  }),
  password: z.string().min(1, "passwordRequired"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
