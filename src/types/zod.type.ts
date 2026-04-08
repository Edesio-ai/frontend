import { createSessionFormSchema } from "@/utils/constants/zod";
import { z } from "zod";

export type CreateSessionFormValues = z.infer<typeof createSessionFormSchema>;
  