import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, UserRole } from "@/lib/supabaseClient";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (
        email: string,
        password: string,
        metadata: { role: UserRole; firstName?: string; lastName?: string; establishment?: string; invitationToken?: string }
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
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
        session,
        loading,
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
