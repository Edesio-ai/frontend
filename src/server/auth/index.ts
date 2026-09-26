import { EstablishmentAddress, EstablishmentType, LoginResult, UserRole } from "@/types";
import type { LoginInput } from "./schema";
import { authenticatedBackendFetch, backendFetch } from "../http/backend";
import { applyBackendSetCookies, getCsrfToken } from "../http/cookies";
import { ApiResponse } from "@/types/teaching/global.type";

type LogoutResult = { success: true };

export type RegisterBody = {
  role: UserRole;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  locale?: "fr" | "en";
};

export type RegisterEstablishmentBody = {
  role: "establishment";
  type: EstablishmentType;
  name: string;
  address: EstablishmentAddress;
  contact: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    acceptTerms: boolean;
  };
  locale?: "fr" | "en";
};

export const login = async (input: LoginInput): Promise<LoginResult> => {
  const response = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    return { ok: false, code: error.code, message: error.message, status: response.status };
  }

  const data = await response.json();
  await applyBackendSetCookies(response);
  return { ok: true, data };
};

export async function logout(): Promise<ApiResponse<LogoutResult>> {
  const response = await authenticatedBackendFetch("/auth/logout", {
    method: "POST",
    headers: {
      "x-csrf-token": await getCsrfToken(),
    },
  });

  await applyBackendSetCookies(response);

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
    return {
      ok: false,
      code: error.code ?? "UNKNOWN",
      message: error.message ?? "Logout failed",
      status: response.status,
    };
  }

  return { ok: true, data: { success: true } };
}

export const register = async (body: RegisterBody) => {
  const response = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return { ok: false, code: error.code, message: error.message, status: response.status };
  }

  return { ok: true };
};

export const registerEstablishment = async (body: RegisterEstablishmentBody) => {
  const response = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return { ok: false, code: error.code, message: error.message, status: response.status };
  }

  return { ok: true };
};
