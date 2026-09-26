import z from "zod";
import { LANGUAGES } from "@/types/teaching/session.type";

export const sessionSchema = z.object({
  id: z.uuid(),
  teacherId: z.uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(LANGUAGES),
  createdAt: z.iso.datetime({ offset: true }),
});

export const sessionWithStudentCountSchema = sessionSchema.extend({
  studentsCount: z.number().int().nonnegative(),
  teacherName: z.string().min(1).optional(),
});
