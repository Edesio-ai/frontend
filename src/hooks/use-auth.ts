import { useState, useEffect, useMemo } from "react";
import { supabase, UserRole } from "@/lib/supabaseClient";
import { authService } from "@/services/auth.service";

export function useAuth() {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUserSession = useMemo(
        () => async () => {
          setLoading(true);
          try {
            const  session = await authService.getUserSession();
            setUser(session.user ?? null);
            setRole(session.role ?? (session.user?.user_metadata?.role as UserRole | null) ?? null);
          } finally {
            setLoading(false);
          }
        },
        [],
      );

      useEffect(() => {
        void refreshUserSession();
      }, [refreshUserSession]);

    const signUp = async (
        email: string,
        password: string,
        role: UserRole,
        acceptTerms: boolean,
        firstname?: string,
        lastname?: string,
        establishment?: string,
        invitationToken?: string,
    ) => {
        const response = await authService.register(email, password, role, acceptTerms, firstname, lastname, establishment, invitationToken);
        return response;
    };

    const signIn = async (email: string, password: string) => {
        const response = await authService.signIn(email, password);
        return response;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const getUserRole = (): UserRole | null => {
        return user?.user_metadata?.role as UserRole | null;
    };

    const resendVerificationEmail = async (email: string) => {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });
        return { data, error };
    };

    const isEmailVerified = (): boolean => {
        return user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;
    };

    const resetPassword = async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { data, error };
    };

    const updatePassword = async (newPassword: string) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        return { data, error };
    };

    return {
        user,
        loading,
        role,
        signUp,
        signIn,
        signOut,
        getUserRole,
        resendVerificationEmail,
        isEmailVerified,
        resetPassword,
        updatePassword,
    };
}
