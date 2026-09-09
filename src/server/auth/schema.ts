import { z } from "zod";
import { PASSWORD_COMPLEXITY_REGEX, PASSWORD_MIN_LENGTH } from "@/lib/password-criteria";

export const loginInputSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" || iss.input == null ? "emailRequired" : "emailInvalid"),
  }),
  password: z.string().min(1, "passwordRequired"),
});

const registerBaseSchema = z.object({
  firstname: z.string().min(1, "firstNameRequired"),
  lastname: z.string().min(1, "lastNameRequired"),
  email: z.email({
    error: (iss) => (iss.input === "" || iss.input == null ? "emailRequired" : "emailInvalid"),
  }),
  password: z
    .string()
    .min(1, "passwordRequired")
    .min(PASSWORD_MIN_LENGTH, "passwordWeak")
    .regex(PASSWORD_COMPLEXITY_REGEX, "passwordWeak"),
  confirmPassword: z.string().min(1, "confirmPasswordRequired"),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "acceptRequired",
  }),
});

function withPasswordMatch<T extends z.ZodType<{ password: string; confirmPassword: string }>>(schema: T) {
  return schema.refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });
}

export const registerSelfLearnerInputSchema = withPasswordMatch(registerBaseSchema);

export const registerTeacherInputSchema = withPasswordMatch(
  registerBaseSchema.extend({ establishment: z.string().optional() }),
);

export const registerStudentInputSchema = registerTeacherInputSchema;

export const registerEstablishmentInputSchema = withPasswordMatch(
  registerBaseSchema.extend({ establishment: z.string().min(1, "establishmentRequired") }),
);

export type LoginInput = z.infer<typeof loginInputSchema>;

export type SelfLearnerInput = z.infer<typeof registerSelfLearnerInputSchema>;
export type TeacherInput = z.infer<typeof registerTeacherInputSchema>;
export type StudentInput = z.infer<typeof registerStudentInputSchema>;
export type EstablishmentInput = z.infer<typeof registerEstablishmentInputSchema>;
export type RegisterInput = SelfLearnerInput | TeacherInput | StudentInput | EstablishmentInput;
