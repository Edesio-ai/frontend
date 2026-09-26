"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordCriteriaList } from "@/components/auth/password-criteria-list";
import { useAuth } from "@/contexts/auth-context";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { useTranslations } from "@/lib/i18n/client";
import type { InvitationTokenPreview } from "@/types/invitation-token.type";
import { getRegisterInvitationPath } from "@/utils/functions/role.utils";
import { getUserDisplayName } from "@/utils/functions/user.utils";
import { registerInvitationAction } from "../invitation/action";
import { emptyInvitationFormValues, initialInvitationState, type InvitationErrorCode } from "../invitation/states";

const UNAVAILABLE_INVITATION_ERRORS: InvitationErrorCode[] = [
  "invitationInvalid",
  "invitationExpired",
  "invitationAlreadyUsed",
];

type TeacherInvitationProps = {
  token: string;
  preview: InvitationTokenPreview | null;
};

export default function TeacherInvitation({ token, preview }: TeacherInvitationProps) {
  const [cachedPreview] = useState(preview);
  const [state, action, isPending] = useActionState(registerInvitationAction, initialInvitationState);
  const router = useRouter();
  const hydrated = useFeatureFlagsHydrated();
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");
  const { refreshUserSession } = useAuth();
  const translations = useTranslations();
  const t = translations.auth.register.new;
  const ti = translations.teacherInvitation;
  const [values, setValues] = useState(emptyInvitationFormValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fullName = cachedPreview ? getUserDisplayName(cachedPreview.firstname, cachedPreview.lastname) : "";

  useEffect(() => {
    if (hydrated && isAuthNewDesign && token) {
      router.replace(getRegisterInvitationPath(token));
    }
  }, [hydrated, isAuthNewDesign, router, token]);

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
    if (code === "confirmPasswordRequired") return ti.confirmRequired;
    if (code === "passwordMismatch") return ti.passwordMismatch;
    if (code === "acceptRequired") return ti.acceptRequired;
    return code ? ti.unknownError : undefined;
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

  if (!hydrated || isAuthNewDesign) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{ti.validating}</p>
        </div>
      </div>
    );
  }

  if (!cachedPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">{ti.invalidInvitation}</h1>
          <p className="mb-6 text-muted-foreground">{ti.validationError}</p>
          <Link href="/">
            <Button data-testid="button-back-home">{ti.backHome}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-block">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
              Edesio
            </span>
          </Link>
          <h1 className="mb-2 text-3xl font-bold" data-testid="text-signup-title">
            {ti.createAccount}
          </h1>
          <p className="text-muted-foreground">{ti.invited}</p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Building2 className="size-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{ti.invitedBy}</p>
              <p className="font-medium">{cachedPreview.establishmentName}</p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <GraduationCap className="size-5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{fullName || ti.teacherAccount}</p>
              <p className="text-sm text-muted-foreground">
                {ti.forEmail} {cachedPreview.maskedEmail}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1">
              <CheckCircle2 className="size-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">{ti.validInvitation}</span>
            </div>
          </div>

          {cachedPreview.assignedChatbots && cachedPreview.assignedChatbots > 0 ? (
            <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="text-sm">
                <span className="font-medium text-amber-700">
                  {cachedPreview.assignedChatbots}{" "}
                  {cachedPreview.assignedChatbots > 1 ? ti.chatbotPlural : ti.chatbotSingular}
                </span>
                <span className="text-amber-600">{ti.chatbotsAllocated}</span>
              </p>
            </div>
          ) : null}

          {error ? (
            <div
              className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
              data-testid="text-error-message"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <form action={action} noValidate className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div>
              <Label htmlFor="password">{ti.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordError)}
                  data-testid="input-signup-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((visible) => !visible)}
                  data-testid="button-toggle-password"
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

            <div>
              <Label htmlFor="confirmPassword">{ti.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={values.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                  aria-invalid={Boolean(confirmPasswordError)}
                  data-testid="input-signup-confirm-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  data-testid="button-toggle-confirm-password"
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

            <PasswordCriteriaList
              password={values.password}
              confirmPassword={values.confirmPassword}
              labels={translations.auth.register.legacy.common.contact.passwordCriteria}
            />

            <div className="flex items-start space-x-3 pt-2">
              <input type="hidden" name="acceptTerms" value={values.acceptTerms ? "on" : ""} />
              <Checkbox
                id="acceptTerms"
                checked={values.acceptTerms}
                onCheckedChange={(checked) => updateField("acceptTerms", checked === true)}
                aria-invalid={Boolean(acceptTermsError)}
                data-testid="checkbox-terms"
              />
              <label htmlFor="acceptTerms" className="cursor-pointer text-sm font-normal">
                {ti.acceptTerms}
              </label>
            </div>
            {acceptTermsError ? (
              <p role="alert" className="text-sm text-destructive">
                {acceptTermsError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending || isInvitationUnavailable}
              data-testid="button-signup-submit"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {ti.creating}
                </>
              ) : (
                ti.create
              )}
            </Button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {ti.hasAccount}{" "}
              <Link href="/login" className="text-primary hover:underline" data-testid="link-login-bottom">
                {ti.login}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
