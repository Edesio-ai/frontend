"use server";

import { z } from "zod";
import { login } from "@/server/auth/login";
import { loginInputSchema } from "@/server/auth/schema";
import { getPostLoginPath } from "@/utils/functions/role.utils";
import { LoginState } from "./state";

export const loginAction = async (_prev: LoginState, formData: FormData): Promise<LoginState> => {
  const parsed = loginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      redirectTo: null,
    };
  }

  const result = await login(parsed.data);

  if (!result.ok) {
    return {
      error: result.code === "UNKNOWN_ERROR" ? "defaultError" : result.code,
      fieldErrors: {},
      redirectTo: null,
    };
  }

  return {
    error: null,
    fieldErrors: {},
    redirectTo: getPostLoginPath(result.user.metadata.role),
  };
};
