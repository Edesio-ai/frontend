import { apiFetch } from "@/lib/api-client";
import { UserRole } from "@/lib/supabaseClient";
import { User } from "@/types/user.type";

export const authService = {
    async initCsrf(): Promise<any> {
        return await apiFetch<any>("/api/auth/csrf", {
            method: "GET",
        });
    },
    async register(email: string, password: string, role: UserRole, acceptTerms: boolean, firstname?: string, lastname?: string, establishment?: string, invitationToken?: string): Promise<any> {
        const body = {
            email,
            password,
            role,
            acceptTerms,
            firstname,
            lastname,
            establishment,
            invitationToken
        }

        return await apiFetch<any>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async signIn(email: string, password: string): Promise<{success: boolean, user: User }> {
        return await apiFetch<{success: boolean, user: User }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },
    async getUserSession(): Promise<any> {
        return await apiFetch<any>("/api/auth/session", {
            method: "GET",
        });
    },
    async logout(): Promise<any> {
        return await apiFetch<any>("/api/auth/logout", {
            method: "POST",
        });
    },
    async checkInvitationToken(token: string): Promise<any> {
        return await apiFetch<any>(`/check-invitation/${token}`, {
            method: "GET",
        });
    },
    async signupTeacherByInvitation(body: any): Promise<any> {
        return await apiFetch<any>("/api/auth/register/teacher", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
};