import type { z } from "zod";
import type {
  establishmentAddressSchema,
  establishmentDashboardSchema,
  establishmentSchema,
  establishmentStatsSchema,
  deleteTeacherSchema,
  inviteTeacherSchema,
  createInvitationTokenSchema,
} from "@/server/establishment/schema";
import { ESTABLISHMENT_COUNTRIES, ESTABLISHMENT_TYPES } from "@/utils/constants/establishment";

export { ESTABLISHMENT_COUNTRIES, ESTABLISHMENT_TYPES };

export type EstablishmentCountry = (typeof ESTABLISHMENT_COUNTRIES)[number];

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

export type EstablishmentAddress = z.infer<typeof establishmentAddressSchema>;

export type Establishment = z.infer<typeof establishmentSchema>;

export type EstablishmentStats = z.infer<typeof establishmentStatsSchema>;

export type EstablishmentDashboard = z.infer<typeof establishmentDashboardSchema>;

export type DeleteTeacher = z.infer<typeof deleteTeacherSchema>;

export type InviteTeacher = z.infer<typeof inviteTeacherSchema>;

export type CreateInvitationToken = z.infer<typeof createInvitationTokenSchema>;
