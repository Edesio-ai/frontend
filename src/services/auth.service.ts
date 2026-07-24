import { apiFetch } from "@/lib/api-client";
import { UserRole } from "@/types";
import { User } from "@/types/user.type";

type AuthSessionResponse = {
  user: User | null;
  role: UserRole | null;
};

type TeacherInvitationSignupBody = {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  invitationToken: string;
  acceptTerms: boolean;
};

export const authService = {
  async initCsrf(): Promise<Record<string, unknown>> {
    return await apiFetch<Record<string, unknown>>("/api/auth/csrf", {
      method: "GET",
    });
  },
  async register(
    email: string,
    password: string,
    role: UserRole,
    acceptTerms: boolean,
    firstname?: string,
    lastname?: string,
    establishment?: string,
    invitationToken?: string,
  ): Promise<{ success: boolean }> {
    const body = {
      email,
      password,
      role,
      acceptTerms,
      firstname,
      lastname,
      establishment,
      invitationToken,
    };

    return await apiFetch<{ success: boolean }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  async signIn(email: string, password: string): Promise<{ success: boolean; user: User }> {
    return await apiFetch<{ success: boolean; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async getUserSession(): Promise<AuthSessionResponse> {
    const authToken = localStorage.getItem("sb-127-auth-token")
      ? JSON.parse(localStorage.getItem("sb-127-auth-token") ?? "")
      : null;

    return await apiFetch<AuthSessionResponse>(
      "/api/auth/session",
      authToken
        ? {
            method: "GET",
            headers: {
              authorization: `Bearer ${authToken.access_token}`,
            },
          }
        : { method: "GET" },
    );
  },
  async logout(): Promise<Record<string, unknown>> {
    return await apiFetch<Record<string, unknown>>("/api/auth/logout", {
      method: "POST",
    });
  },
  async signupTeacherByInvitation(body: TeacherInvitationSignupBody): Promise<Record<string, unknown>> {
    return await apiFetch<Record<string, unknown>>("/api/auth/register/teacher", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  async resetPassword(email: string): Promise<void> {
    return await apiFetch<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async updatePassword(password: string): Promise<void> {
    const authToken = JSON.parse(localStorage.getItem("sb-127-auth-token") || "{}");

    await apiFetch<void>("/api/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: {
        authorization: `Bearer ${authToken.access_token}`,
      },
    });

    localStorage.removeItem("sb-127-auth-token");
  },
};
