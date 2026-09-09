"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { registerAction } from "../action";
import { initialRegisterState } from "../state";

export function useRegister() {
  const t = useTranslations().auth.register.new;
  const supabaseErrors = useTranslations().supabaseErrors;
  const router = useRouter();
  const { refreshUserSession } = useAuth();
  const [state, action, pending] = useActionState(registerAction, initialRegisterState);

  useEffect(() => {
    if (!state.redirectTo) return;

    void refreshUserSession().then(() => {
      router.replace(state.redirectTo!);
    });
  }, [state.redirectTo, refreshUserSession, router]);

  const fieldMessage = (codes?: string[]) => {
    const code = codes?.[0];
    if (code === "firstNameRequired") return t.firstNameRequired;
    if (code === "lastNameRequired") return t.lastNameRequired;
    if (code === "emailRequired") return t.emailRequired;
    if (code === "emailInvalid") return t.emailInvalid;
    if (code === "passwordRequired") return t.passwordRequired;
    if (code === "passwordWeak") return t.passwordWeak;
    if (code === "confirmPasswordRequired") return t.confirmPasswordRequired;
    if (code === "passwordMismatch") return t.passwordMismatch;
    if (code === "acceptRequired") return t.acceptRequired;
    if (code === "establishmentRequired") return t.establishmentRequired;
    return code ? t.defaultError : undefined;
  };

  const resolveError = (code: string | null) => {
    if (!code) return null;
    if (code === "defaultError") return t.defaultError;
    if (code === "signInError") return t.signInError;
    if (code in supabaseErrors && code !== "genericError") {
      return supabaseErrors[code as keyof typeof supabaseErrors];
    }
    return t.defaultError;
  };

  return {
    action,
    pending: pending || Boolean(state.redirectTo),
    values: state.values,
    error: resolveError(state.error),
    firstnameError: fieldMessage(state.fieldErrors.firstname),
    lastnameError: fieldMessage(state.fieldErrors.lastname),
    emailError: fieldMessage(state.fieldErrors.email),
    passwordError: fieldMessage(state.fieldErrors.password),
    confirmPasswordError: fieldMessage(state.fieldErrors.confirmPassword),
    acceptTermsError: fieldMessage(state.fieldErrors.acceptTerms),
    establishmentError: fieldMessage(state.fieldErrors.establishment),
  };
}
