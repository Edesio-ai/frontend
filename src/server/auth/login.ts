import { LoginResult } from "@/types";
import type { LoginInput } from "./schema";
import { backendFetch } from "../http/backend";
import { applyBackendSetCookies } from "../http/cookies";

export const login = async (input: LoginInput): Promise<LoginResult> => {
  const response = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    return { ok: false, code: error.code, message: error.message };
  }

  const data = await response.json();
  await applyBackendSetCookies(response);
  return { ok: true, user: data };
};
