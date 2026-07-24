"use client";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/types";
import { User } from "@/types/user.type";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    acceptTerms: boolean,
    firstname?: string,
    lastname?: string,
    establishment?: string,
    invitationToken?: string,
  ) => Promise<{ success: boolean }>;
  signIn: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getUserRole: () => UserRole | null;
  resetPassword: (email: string) => Promise<void>;
  refreshUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserSession = useCallback(async () => {
    setLoading(true);
    try {
      const session = await authService.getUserSession();
      setUser(session.user ?? null);
      setRole(session.role ?? (session.user?.metadata?.role as UserRole | null) ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const signIn = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { user } = await authService.signIn(email, password);
      await refreshUserSession();
      return user;
    },
    [refreshUserSession],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole,
      acceptTerms: boolean,
      firstname?: string,
      lastname?: string,
      establishment?: string,
      invitationToken?: string,
    ): Promise<{ success: boolean }> => {
      return await authService.register(
        email,
        password,
        role,
        acceptTerms,
        firstname,
        lastname,
        establishment,
        invitationToken,
      );
    },
    [],
  );

  const getUserRole = useCallback(() => {
    return role;
  }, [role]);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      signUp,
      signIn,
      logout,
      getUserRole,
      resetPassword,
      refreshUserSession,
    }),
    [user, role, loading, signUp, signIn, logout, getUserRole, resetPassword, refreshUserSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
