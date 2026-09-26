"use server";

import { z } from "zod";
import { USER_ROLE } from "@/types";
import { login, register } from "@/server/auth";
import { registerInvitationInputSchema } from "@/server/auth/schema";
import { getInvitationPreview } from "@/server/invitation-token";
import { getLocaleFromCookies } from "@/lib/i18n";
import { toBackendLocale } from "@/lib/i18n/config";
import { getPostLoginPath } from "@/utils/functions/role.utils";
import type { InvitationErrorCode, InvitationFormValues, InvitationState } from "./states";

const BACKEND_ERROR_CODES: Record<string, InvitationErrorCode> = {
  INVITATION_TOKEN_NOT_FOUND: "invitationInvalid",
  INVITATION_TOKEN_EXPIRED: "invitationExpired",
  INVITATION_TOKEN_ALREADY_USED: "invitationAlreadyUsed",
  INVITATION_EMAIL_MISMATCH: "invitationEmailMismatch",
  USER_ALREADY_EXISTS: "userAlreadyRegistered",
};

const toInvitationErrorCode = (code?: string, message?: string): InvitationErrorCode => {
  if (code && BACKEND_ERROR_CODES[code]) {
    return BACKEND_ERROR_CODES[code];
  }

  if (message && /already (been )?registered|already exists/i.test(message)) {
    return "userAlreadyRegistered";
  }

  return "defaultError";
};

function parseFormValues(formData: FormData): InvitationFormValues {
  return {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
  };
}

const failure = (
  values: InvitationFormValues,
  error: InvitationErrorCode | null,
  fieldErrors: InvitationState["fieldErrors"] = {},
): InvitationState => ({
  error,
  fieldErrors,
  redirectTo: null,
  values,
});

export const registerInvitationAction = async (
  _prev: InvitationState,
  formData: FormData,
): Promise<InvitationState> => {
  const values = parseFormValues(formData);

  const parsed = registerInvitationInputSchema.safeParse({
    ...values,
    token: String(formData.get("token") ?? ""),
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return failure(values, fieldErrors.token ? "invitationInvalid" : null, fieldErrors);
  }

  const { token, password, acceptTerms } = parsed.data;

  const preview = await getInvitationPreview(token);

  if (!preview.ok) {
    return failure(values, toInvitationErrorCode(preview.code, preview.message));
  }

  const result = await register({
    role: USER_ROLE.teacher,
    password,
    acceptTerms,
    invitationToken: token,
    locale: toBackendLocale(await getLocaleFromCookies()),
  });

  if (!result.ok) {
    console.error("Invitation register failed", result.code, result.message);
    return failure(values, toInvitationErrorCode(result.code, result.message));
  }

  const loginResult = await login({ email: preview.data.invitedEmail, password });

  if (!loginResult.ok) {
    return failure(values, "signInError");
  }

  return {
    error: null,
    fieldErrors: {},
    redirectTo: getPostLoginPath(loginResult.data.metadata.role),
    values,
  };
};
