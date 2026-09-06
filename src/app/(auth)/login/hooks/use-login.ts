"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { loginAction } from "../actions";
import { initialLoginState } from "../state";

export function useLogin() {
  const t = useTranslations().auth.login.new;
  const router = useRouter();
  const { refreshUserSession } = useAuth();
  const [state, action, pending] = useActionState(loginAction, initialLoginState);

  useEffect(() => {
    if (!state.redirectTo) return;

    void refreshUserSession().then(() => {
      router.replace(state.redirectTo!);
    });
  }, [state.redirectTo, refreshUserSession, router]);

  const fieldMessage = (codes?: string[]) => {
    const code = codes?.[0];
    if (code === "emailRequired") return t.emailRequired;
    if (code === "emailInvalid") return t.emailInvalid;
    if (code === "passwordRequired") return t.passwordRequired;
    return code ? t.defaultError : undefined;
  };

  return {
    action,
    pending: pending || Boolean(state.redirectTo),
    error: state.error ? t.defaultError : null,
    emailError: fieldMessage(state.fieldErrors.email),
    passwordError: fieldMessage(state.fieldErrors.password),
  };
}
