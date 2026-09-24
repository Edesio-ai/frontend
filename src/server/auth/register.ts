import { type EstablishmentAddress, type EstablishmentType, UserRole } from "@/types";
import { backendFetch } from "../http/backend";

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
