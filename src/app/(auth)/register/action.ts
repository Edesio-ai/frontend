"use server";

import { z } from "zod";
import { USER_ROLE, type PublicRole } from "@/types";
import { isPublicRole } from "@/utils/functions/role.utils";
import { login } from "@/server/auth/login";
import {
  registerEstablishmentInputSchema,
  registerSelfLearnerInputSchema,
  registerStudentInputSchema,
  registerTeacherInputSchema,
} from "@/server/auth/schema";
import { getLocaleFromCookies } from "@/lib/i18n";
import { type RegisterFormValues, type RegisterState } from "./state";
import { register } from "@/server/auth/register";

function parseFormValues(formData: FormData): RegisterFormValues {
  return {
    firstname: String(formData.get("firstname") ?? ""),
    lastname: String(formData.get("lastname") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
    establishment: String(formData.get("establishment") ?? ""),
  };
}

function getRegisterRedirectPath(role: PublicRole): string {
  if (role === USER_ROLE.student) {
    return "/student";
  }

  const planByRole = {
    [USER_ROLE.selfLearner]: "self-learner",
    [USER_ROLE.teacher]: "teacher",
    [USER_ROLE.establishment]: "establishment",
  } as const;

  return `/billing/choose-plan?plan=${planByRole[role]}`;
}

const REGISTER_SCHEMAS = {
  [USER_ROLE.selfLearner]: registerSelfLearnerInputSchema,
  [USER_ROLE.teacher]: registerTeacherInputSchema,
  [USER_ROLE.student]: registerStudentInputSchema,
  [USER_ROLE.establishment]: registerEstablishmentInputSchema,
} as const;

export const registerAction = async (_prev: RegisterState, formData: FormData): Promise<RegisterState> => {
  const values = parseFormValues(formData);
  const role = formData.get("role");

  if (typeof role !== "string" || !isPublicRole(role)) {
    return {
      error: "defaultError",
      fieldErrors: {},
      redirectTo: null,
      values,
    };
  }

  const parsed = REGISTER_SCHEMAS[role].safeParse({
    firstname: values.firstname,
    lastname: values.lastname,
    email: values.email,
    password: values.password,
    confirmPassword: values.confirmPassword,
    acceptTerms: values.acceptTerms,
    establishment: values.establishment || undefined,
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      redirectTo: null,
      values,
    };
  }

  const locale = await getLocaleFromCookies();

  const result = await register({
    role,
    firstname: parsed.data.firstname,
    lastname: parsed.data.lastname,
    email: parsed.data.email,
    password: parsed.data.password,
    acceptTerms: parsed.data.acceptTerms,
    locale,
    establishment:
      "establishment" in parsed.data && typeof parsed.data.establishment === "string"
        ? parsed.data.establishment
        : undefined,
  });

  if (!result.ok) {
    return {
      error: result.code === "UNKNOWN_ERROR" ? "defaultError" : result.code,
      fieldErrors: {},
      redirectTo: null,
      values,
    };
  }

  const loginResult = await login({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!loginResult.ok) {
    return {
      error: "signInError",
      fieldErrors: {},
      redirectTo: null,
      values,
    };
  }

  return {
    error: null,
    fieldErrors: {},
    redirectTo: getRegisterRedirectPath(role),
    values,
  };
};
