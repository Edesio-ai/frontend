import { z } from "zod";
import { inviteTeacherSchema } from "@/server/establishment/schema";

export interface InvitationToken {
  id: string;
  establishmentId: string;
  token: string;
  firstname: string;
  lastname: string;
  invitedEmail: string;
  expiresAt: string;
  usedAt: string | null;
  usedBy: string | null;
  createdAt: string;
  assignedChatbots: number;
  availableChatbots?: number;
}

export type EstablishmentInvitation = Pick<
  InvitationToken,
  "id" | "invitedEmail" | "createdAt" | "usedAt" | "firstname" | "lastname" | "assignedChatbots"
>;

export interface InvitationTokenPreview {
  maskedEmail: string;
  establishmentName: string;
  assignedChatbots?: number;
}

export interface InvitationTokenMutationResponse {
  success: boolean;
}

export interface ValidateInvitationTokenResponse {
  data: unknown;
}

export type TeacherInvitation = z.infer<typeof inviteTeacherSchema>;

export type InviteTeacherState = {
  error: string | null;
  fieldErrors: {
    firstname?: string[];
    lastname?: string[];
    email?: string[];
    assignedChatbots?: string[];
  };
  values: TeacherInvitation;
  invitedEmail: string | null;
};
