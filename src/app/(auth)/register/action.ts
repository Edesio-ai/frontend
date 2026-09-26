"use server";

import { z } from "zod";
import { USER_ROLE, type PublicRole } from "@/types";
import { isPublicRole } from "@/utils/functions/role.utils";
import { login } from "@/server/auth";
import {
  registerEstablishmentInputSchema,
  type EstablishmentInput,
  registerSelfLearnerInputSchema,
  registerStudentInputSchema,
  registerTeacherInputSchema,
} from "@/server/auth/schema";
import { getLocaleFromCookies } from "@/lib/i18n";
import { toBackendLocale } from "@/lib/i18n/config";
import { type RegisterFormValues, type RegisterState } from "./state";
import { register, registerEstablishment } from "@/server/auth";

function parseFormValues(formData: FormData): RegisterFormValues {
  return {
    firstname: String(formData.get("firstname") ?? ""),
    lastname: String(formData.get("lastname") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
    establishmentName: String(formData.get("establishmentName") ?? ""),
    establishmentType: String(formData.get("establishmentType") ?? "") as RegisterFormValues["establishmentType"],
    addressStreet: String(formData.get("addressStreet") ?? ""),
    addressZipCode: String(formData.get("addressZipCode") ?? ""),
    addressCity: String(formData.get("addressCity") ?? ""),
    addressCountry: String(formData.get("addressCountry") ?? "") as RegisterFormValues["addressCountry"],
  };
}

function getRegisterRedirectPath(role: PublicRole): string {
  if (role === USER_ROLE.student) {
    return "/student";
  }

  const routeByRole = {
    [USER_ROLE.selfLearner]: "self-learner",
    [USER_ROLE.teacher]: "teacher",
    [USER_ROLE.establishment]: "/establishment/overview",
  } as const;

  return routeByRole[role];
}

const REGISTER_SCHEMAS = {
  [USER_ROLE.selfLearner]: registerSelfLearnerInputSchema,
  [USER_ROLE.teacher]: registerTeacherInputSchema,
  [USER_ROLE.student]: registerStudentInputSchema,
  [USER_ROLE.establishment]: registerEstablishmentInputSchema,
} as const;

function buildParsedPayload(role: PublicRole, values: RegisterFormValues) {
  const base = {
    firstname: values.firstname,
    lastname: values.lastname,
    email: values.email,
    password: values.password,
    confirmPassword: values.confirmPassword,
    acceptTerms: values.acceptTerms,
  };

  if (role === USER_ROLE.establishment) {
    return {
      ...base,
      establishmentName: values.establishmentName,
      establishmentType: values.establishmentType,
      addressStreet: values.addressStreet,
      addressZipCode: values.addressZipCode,
      addressCity: values.addressCity,
      addressCountry: values.addressCountry,
    };
  }

  return base;
}

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

  const parsed = REGISTER_SCHEMAS[role].safeParse(buildParsedPayload(role, values));

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      redirectTo: null,
      values,
    };
  }

  const locale = toBackendLocale(await getLocaleFromCookies());

  const result =
    role === USER_ROLE.establishment
      ? await registerEstablishment({
          role: "establishment",
          type: (parsed.data as EstablishmentInput).establishmentType,
          name: (parsed.data as EstablishmentInput).establishmentName,
          address: {
            street: (parsed.data as EstablishmentInput).addressStreet,
            zipCode: (parsed.data as EstablishmentInput).addressZipCode,
            city: (parsed.data as EstablishmentInput).addressCity,
            country: (parsed.data as EstablishmentInput).addressCountry,
          },
          contact: {
            firstname: parsed.data.firstname,
            lastname: parsed.data.lastname,
            email: parsed.data.email,
            password: parsed.data.password,
            acceptTerms: parsed.data.acceptTerms,
          },
          locale,
        })
      : await register({
          role,
          firstname: parsed.data.firstname,
          lastname: parsed.data.lastname,
          email: parsed.data.email,
          password: parsed.data.password,
          acceptTerms: parsed.data.acceptTerms,
          locale,
        });

  if (!result.ok) {
    return {
      error:
        result.code === "USER_ALREADY_EXISTS"
          ? "userAlreadyRegistered"
          : result.code === "UNKNOWN_ERROR"
            ? "defaultError"
            : result.code,
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
