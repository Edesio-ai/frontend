import { z } from "zod";
import { teacherWithStatsSchema } from "../teacher/schema";
import { ESTABLISHMENT_COUNTRIES, ESTABLISHMENT_TYPES } from "@/utils/constants/establishment";
import { BACKEND_LOCALES } from "@/lib/i18n/config";

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

export const deleteTeacherSchema = z.object({
  teacherId: z.uuid(),
});

export const inviteTeacherSchema = z.object({
  firstname: z.string().trim().min(1, "firstnameRequired"),
  lastname: z.string().trim().min(1, "lastnameRequired"),
  email: z.string().trim().min(1, "emailRequired").pipe(z.email("emailInvalid")),
  assignedChatbots: z.coerce.number().int("assignedChatbotsInvalid").min(0, "assignedChatbotsInvalid"),
});

export const createInvitationTokenSchema = z.object({
  establishmentId: z.uuid(),
  token: z.string().min(1),
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1),
  invitedEmail: z.email(),
  expiresAt: z.iso.datetime({ offset: true }),
  assignedChatbots: z.number().int().min(0),
  locale: z.enum(BACKEND_LOCALES),
});
