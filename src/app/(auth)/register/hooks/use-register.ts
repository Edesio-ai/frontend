"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { registerAction } from "../action";
import { initialRegisterState } from "../state";

export function useRegister() {
  const t = useTranslations().auth.register.new;
  const establishmentLabels = useTranslations().auth.register.legacy.establishment;
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
    if (code === "establishmentTypeRequired") return establishmentLabels.type.required;
    if (code === "streetRequired") return establishmentLabels.address.street.required;
    if (code === "zipCodeRequired") return establishmentLabels.address.zipCode.required;
    if (code === "cityRequired") return establishmentLabels.address.city.required;
    if (code === "countryRequired") return establishmentLabels.address.country.required;
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
    establishmentNameError: fieldMessage(state.fieldErrors.establishmentName),
    establishmentTypeError: fieldMessage(state.fieldErrors.establishmentType),
    addressStreetError: fieldMessage(state.fieldErrors.addressStreet),
    addressZipCodeError: fieldMessage(state.fieldErrors.addressZipCode),
    addressCityError: fieldMessage(state.fieldErrors.addressCity),
    addressCountryError: fieldMessage(state.fieldErrors.addressCountry),
  };
}
