import { z } from "zod";

export const createSessionFormSchema = z.object({
    sessionName: z.string().min(1, "Le nom de la session est requis").max(100, "Le nom est trop long"),
    sessionLanguage: z.enum(["francais", "anglais", "espagnol", "allemand"]),
    courseTitle: z.string().min(1, "Le titre du cours est requis").max(200, "Le titre est trop long"),
    courseDescription: z.string().max(500, "La description est trop longue").optional().or(z.literal("")),
    courseContent: z.string().optional().or(z.literal("")),
});