import { z } from "zod";
import { teacherWithStatsSchema } from "../teacher/schema";
import { ESTABLISHMENT_COUNTRIES, ESTABLISHMENT_TYPES } from "@/utils/constants/establishment";

export const establishmentAddressSchema = z.object({
  street: z.string().min(1),
  zipCode: z.string().min(1),
  city: z.string().min(1),
  country: z.enum(ESTABLISHMENT_COUNTRIES),
});

export const establishmentSchema = z.object({
  id: z.uuid(),
  supabaseUserId: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
  type: z.enum(ESTABLISHMENT_TYPES),
  address: establishmentAddressSchema,
  createdAt: z.iso.datetime({ offset: true }),
});

export const establishmentStatsSchema = z.object({
  totalStudents: z.number().int().nonnegative(),
  totalTeachers: z.number().int().nonnegative(),
  totalSessions: z.number().int().nonnegative(),
});

export const establishmentDashboardSchema = z.object({
  establishment: establishmentSchema,
  stats: establishmentStatsSchema,
  teachers: z.array(teacherWithStatsSchema),
});
