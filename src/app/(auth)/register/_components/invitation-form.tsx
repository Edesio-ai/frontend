"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "../../_components/required-mark";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { getPasswordCriteria } from "@/lib/password-criteria";
import { registerInvitationAction } from "../invitation/action";
import { emptyInvitationFormValues, initialInvitationState, type InvitationErrorCode } from "../invitation/states";

const PASSWORD_CRITERIA_KEYS = ["minLength", "uppercase", "lowercase", "number", "special", "match"] as const;

const UNAVAILABLE_INVITATION_ERRORS: InvitationErrorCode[] = [
  "invitationInvalid",
  "invitationExpired",
  "invitationAlreadyUsed",
];

type InvitationFormProps = {
  token: string;
};

export default function InvitationForm({ token }: InvitationFormProps) {
  const [state, action, isPending] = useActionState(registerInvitationAction, initialInvitationState);
  const router = useRouter();
  const { refreshUserSession } = useAuth();
  const t = useTranslations().auth.register.new;
  const [values, setValues] = useState(emptyInvitationFormValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const criteria = getPasswordCriteria(values.password, values.confirmPassword);

  useEffect(() => {
    if (!state.redirectTo) return;

    void refreshUserSession().then(() => {
      router.replace(state.redirectTo!);
    });
  }, [state.redirectTo, refreshUserSession, router]);

  const fieldMessage = (codes?: string[]) => {
    const code = codes?.[0];
    if (code === "passwordRequired") return t.passwordRequired;
    if (code === "passwordWeak") return t.passwordWeak;
    if (code === "confirmPasswordRequired") return t.confirmPasswordRequired;
    if (code === "passwordMismatch") return t.passwordMismatch;
    if (code === "acceptRequired") return t.acceptRequired;
    return code ? t.defaultError : undefined;
  };

  const resolveError = (code: InvitationErrorCode | null) => {
    if (!code) return null;
    if (code === "signInError") return t.signInError;
    if (code === "defaultError") return t.defaultError;
    return t.invitation.errors[code];
  };

  const pending = isPending || Boolean(state.redirectTo);
  const error = resolveError(state.error);
  const isInvitationUnavailable = state.error !== null && UNAVAILABLE_INVITATION_ERRORS.includes(state.error);
  const passwordError = fieldMessage(state.fieldErrors.password);
  const confirmPasswordError = fieldMessage(state.fieldErrors.confirmPassword);
  const acceptTermsError = fieldMessage(state.fieldErrors.acceptTerms);

  const updateField = <K extends keyof typeof values>(field: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <form action={action} noValidate>
      <input type="hidden" name="token" value={token} />

      <div className="mb-[18px]">
        <Label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold">
          {t.password}
          <RequiredMark />
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder={t.passwordPlaceholder}
            className="pr-10"
            autoComplete="new-password"
            aria-invalid={Boolean(passwordError)}
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-landing-subtle hover:text-primary"
            aria-label={showPassword ? t.hidePassword : t.showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {passwordError ? (
          <p role="alert" className="mt-1 text-sm text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      <div className="mb-4">
        <Label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-semibold">
          {t.confirmPassword}
          <RequiredMark />
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={values.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            placeholder={t.passwordPlaceholder}
            className="pr-10"
            autoComplete="new-password"
            aria-invalid={Boolean(confirmPasswordError)}
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-landing-subtle hover:text-primary"
            aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
            onClick={() => setShowConfirmPassword((visible) => !visible)}
          >
            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {confirmPasswordError ? (
          <p role="alert" className="mt-1 text-sm text-destructive">
            {confirmPasswordError}
          </p>
        ) : null}
      </div>

      <ul className="mb-[22px] grid grid-cols-2 gap-x-3.5 gap-y-1.5">
        {PASSWORD_CRITERIA_KEYS.map((key) => {
          const met = criteria[key];
          return (
            <li key={key} className={`flex items-center gap-1.5 ${met ? "text-green-700" : "text-landing-subtle"}`}>
              {met ? <CheckCircle2 className="size-[13px] shrink-0" /> : <Circle className="size-[13px] shrink-0" />}
              <span className="text-xs">{t.passwordCriteria[key]}</span>
            </li>
          );
        })}
      </ul>

      <div className="mb-6 flex items-start gap-2.5">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          checked={values.acceptTerms}
          onChange={(event) => updateField("acceptTerms", event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
          aria-invalid={Boolean(acceptTermsError)}
        />
        <label htmlFor="acceptTerms" className="text-[13px] leading-normal text-zinc-700">
          {t.acceptTerms}{" "}
          <Link href="/terms-of-service" className="text-primary no-underline hover:text-primary/80">
            {t.termsLink}
          </Link>{" "}
          {t.and}{" "}
          <Link href="/privacy-policy" className="text-primary no-underline hover:text-primary/80">
            {t.privacyLink}
          </Link>
          .<RequiredMark />
        </label>
      </div>
      {acceptTermsError ? (
        <p role="alert" className="-mt-4 mb-4 text-sm text-destructive">
          {acceptTermsError}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mb-4 text-sm text-destructive" data-testid="text-invitation-error">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="mb-6 h-auto w-full py-3 text-sm font-bold"
        disabled={pending || isInvitationUnavailable}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : t.invitation.submit}
      </Button>
    </form>
  );
}
