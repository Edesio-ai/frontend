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
        const authToken = localStorage.getItem("sb-127-auth-token") ? JSON.parse(localStorage.getItem("sb-127-auth-token") ?? "") : null;
        
        return await apiFetch<any>("/api/auth/session", authToken ? {
            method: "GET",
            headers: {
                authorization: `Bearer ${authToken.access_token}`,
            },
        } : { method: "GET" });
    },
    async logout(): Promise<any> {
        return await apiFetch<any>("/api/auth/logout", {
            method: "POST",
        });
    },
    async signupTeacherByInvitation(body: any): Promise<any> {
        return await apiFetch<any>("/api/auth/register/teacher", {
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
                "authorization": `Bearer ${authToken.access_token}`,
            },
        });
        
        localStorage.removeItem("sb-127-auth-token");
    },
};