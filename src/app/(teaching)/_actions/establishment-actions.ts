"use server";

import { deleteTeacher, getEstablishmentDashboard, sendTeacherInvitation } from "@/server/establishment";
import { z } from "zod";
import { deleteTeacherSchema, inviteTeacherSchema } from "@/server/establishment/schema";
import type { InviteTeacherState, TeacherInvitation } from "@/types";
import { emptyInviteTeacherFormValues } from "../establishment/state";
import type { CreateInvitationToken, DeleteTeacher, EstablishmentDashboard } from "@/types/teaching/establishment.type";
import type { ApiResponse } from "@/types/teaching/global.type";
import { generateInvitationCode } from "@/utils/functions/establishment.utils";
import { getLocaleFromCookies } from "@/lib/i18n";
import { toBackendLocale, type Locale } from "@/lib/i18n/config";

const INVITATION_EXPIRES_IN_DAYS = 7;

export async function getEstablishmentDashboardAction(): Promise<ApiResponse<EstablishmentDashboard>> {
  return getEstablishmentDashboard();
}

export async function deleteTeacherAction(input: DeleteTeacher): Promise<ApiResponse<void>> {
  const parsed = deleteTeacherSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Invalid input",
      status: 400,
    };
  }

  return deleteTeacher(parsed.data.teacherId);
}

function parseInviteTeacherFormValues(formData: FormData): TeacherInvitation {
  return {
    firstname: String(formData.get("firstname") ?? ""),
    lastname: String(formData.get("lastname") ?? ""),
    email: String(formData.get("email") ?? ""),
    assignedChatbots: Number(formData.get("assignedChatbots") ?? 0),
  };
}

function toCreateInvitationToken(
  establishmentId: string,
  values: TeacherInvitation,
  locale: Locale,
): CreateInvitationToken {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRES_IN_DAYS);

  return {
    establishmentId,
    token: generateInvitationCode(),
    firstname: values.firstname,
    lastname: values.lastname,
    invitedEmail: values.email.toLowerCase(),
    expiresAt: expiresAt.toISOString(),
    assignedChatbots: values.assignedChatbots,
    locale: toBackendLocale(locale),
  };
}

export async function sendTeacherInvitationAction(
  _prev: InviteTeacherState,
  formData: FormData,
): Promise<InviteTeacherState> {
  const values = parseInviteTeacherFormValues(formData);
  const parsed = inviteTeacherSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
      invitedEmail: null,
    };
  }

  const dashboard = await getEstablishmentDashboard();
  if (!dashboard.ok) {
    return { error: "defaultError", fieldErrors: {}, values, invitedEmail: null };
  }

  const locale = await getLocaleFromCookies();
  const response = await sendTeacherInvitation(
    toCreateInvitationToken(dashboard.data.establishment.id, parsed.data, locale),
  );

  if (!response.ok) {
    if (response.code === "INVITATION_EMAIL_ALREADY_REGISTERED") {
      return { error: null, fieldErrors: { email: ["emailAlreadyRegistered"] }, values, invitedEmail: null };
    }

    return { error: "defaultError", fieldErrors: {}, values, invitedEmail: null };
  }

  return {
    error: null,
    fieldErrors: {},
    values: emptyInviteTeacherFormValues,
    invitedEmail: parsed.data.email,
  };
}
