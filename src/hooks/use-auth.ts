import { useState, useEffect, useMemo } from "react";
import { UserRole } from "@/types";
import { authService } from "@/services/auth.service";
import { User } from "@/types/user.type";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
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
        void (async () => {
            try {
                await authService.initCsrf();
            } catch (error) {
                console.warn("CSRF initialization failed", error);
            }
            await refreshUserSession();
        })();
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

    const signIn = async (email: string, password: string): Promise<User> => {
        const { user } = await authService.signIn(email, password);
        return user;
    };

    const logout = async (): Promise<void> => {
        await authService.logout();
    };

    const getUserRole = (): UserRole | null => {
        return user?.metadata?.role as UserRole | null;
    };

    const isEmailVerified = (): boolean => {
        return user?.emailConfirmedAt !== null && user?.emailConfirmedAt !== undefined;
    };

    const resetPassword = async (email: string) => {
        await authService.resetPassword(email);
    };

    return {
        user,
        loading,
        role,
        signUp,
        signIn,
        logout,
        getUserRole,
        isEmailVerified,
        resetPassword,
    };
}
