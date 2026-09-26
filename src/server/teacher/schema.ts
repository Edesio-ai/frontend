import { z } from "zod";
import { sessionWithStudentCountSchema } from "../session/schema";

const teacherSchema = z.object({
  id: z.uuid(),
  supabaseUserId: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const teacherWithStatsSchema = teacherSchema.extend({
  sessionsCount: z.number().int().nonnegative(),
  studentsCount: z.number().int().nonnegative(),
  sessions: z.array(sessionWithStudentCountSchema),
});
