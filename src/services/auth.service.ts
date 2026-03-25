import { apiFetch } from "@/lib/api-client";
import { UserRole } from "@/lib/supabaseClient";

export const authService = {
    register(email: string, password: string, role: UserRole, acceptTerms: boolean, firstname?: string, lastname?: string, establishment?: string, invitationToken?: string): Promise<any> {
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

        return apiFetch<any>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    signIn(email: string, password: string): Promise<any> {
        return apiFetch<any>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },
};