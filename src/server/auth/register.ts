import { UserRole } from "@/types";
import { backendFetch } from "../http/backend";

export type RegisterBody = {
  role: UserRole;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  establishment?: string;
  locale?: "fr" | "en";
};

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
