import { z } from "zod";
import { PASSWORD_COMPLEXITY_REGEX, PASSWORD_MIN_LENGTH } from "@/lib/password-criteria";
import { ESTABLISHMENT_COUNTRIES, ESTABLISHMENT_TYPES } from "@/types";

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

export const registerTeacherInputSchema = withPasswordMatch(registerBaseSchema);

export const registerStudentInputSchema = registerTeacherInputSchema;

const establishmentTypeSchema = z.string().trim().min(1, "establishmentTypeRequired").pipe(z.enum(ESTABLISHMENT_TYPES));

const establishmentCountrySchema = z.string().trim().min(1, "countryRequired").pipe(z.enum(ESTABLISHMENT_COUNTRIES));

export const registerEstablishmentInputSchema = withPasswordMatch(
  registerBaseSchema.extend({
    establishmentName: z.string().trim().min(1, "establishmentRequired"),
    establishmentType: establishmentTypeSchema,
    addressStreet: z.string().trim().min(1, "streetRequired"),
    addressZipCode: z.string().trim().min(1, "zipCodeRequired"),
    addressCity: z.string().trim().min(1, "cityRequired"),
    addressCountry: establishmentCountrySchema,
  }),
);

export type LoginInput = z.infer<typeof loginInputSchema>;

export type SelfLearnerInput = z.infer<typeof registerSelfLearnerInputSchema>;
export type TeacherInput = z.infer<typeof registerTeacherInputSchema>;
export type StudentInput = z.infer<typeof registerStudentInputSchema>;
export type EstablishmentInput = z.infer<typeof registerEstablishmentInputSchema>;
export type RegisterInput = SelfLearnerInput | TeacherInput | StudentInput | EstablishmentInput;
