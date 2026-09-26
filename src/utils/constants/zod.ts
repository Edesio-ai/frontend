import { z } from "zod";
import { LANGUAGES } from "@/types/teaching/session.type";

export const createSessionFormSchema = z.object({
  sessionName: z.string().min(1, "Session name is required").max(100, "Name is too long"),
  sessionLanguage: z.enum(LANGUAGES),
  courseTitle: z.string().min(1, "Lesson title is required").max(200, "Title is too long"),
  courseDescription: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
  courseContent: z.string().optional().or(z.literal("")),
});
