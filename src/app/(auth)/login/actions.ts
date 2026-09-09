"use server";

import { z } from "zod";
import { login } from "@/server/auth/login";
import { loginInputSchema } from "@/server/auth/schema";
import { getPostLoginPath } from "@/utils/functions/role.utils";
import { type LoginFormValues, type LoginState } from "./state";

function parseFormValues(formData: FormData): LoginFormValues {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export const loginAction = async (_prev: LoginState, formData: FormData): Promise<LoginState> => {
  const values = parseFormValues(formData);

  const parsed = loginInputSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      redirectTo: null,
      values,
    };
  }

  const result = await login(parsed.data);

  if (!result.ok) {
    return {
      error: result.code === "UNKNOWN_ERROR" ? "defaultError" : result.code,
      fieldErrors: {},
      redirectTo: null,
      values,
    };
  }

  return {
    error: null,
    fieldErrors: {},
    redirectTo: getPostLoginPath(result.data.metadata.role),
    values,
  };
};
