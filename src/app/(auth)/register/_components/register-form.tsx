"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";
import { getPasswordCriteria } from "@/lib/password-criteria";
import { emptyRegisterFormValues } from "../state";
import { useRegister } from "../hooks/use-register";

const fieldLabelClassName = "mb-1.5 block text-[13px] font-semibold";

const PASSWORD_CRITERIA_KEYS = ["minLength", "uppercase", "lowercase", "number", "special", "match"] as const;

type RegisterFormProps = {
  role: string;
  showEstablishmentOptional: boolean;
  showEstablishmentRequired: boolean;
};

export default function RegisterForm({
  role,
  showEstablishmentOptional,
  showEstablishmentRequired,
}: RegisterFormProps) {
  const {
    action,
    pending,
    values: serverValues,
    error,
    firstnameError,
    lastnameError,
    emailError,
    passwordError,
    confirmPasswordError,
    acceptTermsError,
    establishmentError,
  } = useRegister();
  const t = useTranslations().auth.register.new;
  const [values, setValues] = useState(emptyRegisterFormValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const criteria = getPasswordCriteria(values.password, values.confirmPassword);

  useEffect(() => {
    setValues(serverValues);
  }, [serverValues]);

  const updateField = <K extends keyof typeof values>(field: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <form action={action}>
      <input type="hidden" name="role" value={role} />

      <div className="mb-[18px] grid grid-cols-2 gap-3.5">
        <div>
          <Label htmlFor="firstname" className={fieldLabelClassName}>
            {t.firstName}
          </Label>
          <Input
            id="firstname"
            type="text"
            name="firstname"
            value={values.firstname}
            onChange={(event) => updateField("firstname", event.target.value)}
            placeholder={t.firstNamePlaceholder}
          />
          {firstnameError ? (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {firstnameError}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="lastname" className={fieldLabelClassName}>
            {t.lastName}
          </Label>
          <Input
            id="lastname"
            type="text"
            name="lastname"
            value={values.lastname}
            onChange={(event) => updateField("lastname", event.target.value)}
            placeholder={t.lastNamePlaceholder}
          />
          {lastnameError ? (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {lastnameError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mb-[18px]">
        <Label htmlFor="email" className={fieldLabelClassName}>
          {t.email}
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder={t.emailPlaceholder}
        />
        {emailError ? (
          <p role="alert" className="mt-1 text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="mb-[18px]">
        <Label htmlFor="password" className={fieldLabelClassName}>
          {t.password}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder={t.passwordPlaceholder}
            className="pr-10"
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
        <Label htmlFor="confirmPassword" className={fieldLabelClassName}>
          {t.confirmPassword}
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            placeholder={t.passwordPlaceholder}
            className="pr-10"
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

      {showEstablishmentOptional ? (
        <div className="mb-[18px]">
          <Label htmlFor="establishment" className={fieldLabelClassName}>
            {t.establishment} <span className="font-normal text-landing-subtle">{t.establishmentOptional}</span>
          </Label>
          <Input
            id="establishment"
            type="text"
            name="establishment"
            value={values.establishment}
            onChange={(event) => updateField("establishment", event.target.value)}
            placeholder={t.establishmentPlaceholder}
          />
          {establishmentError ? (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {establishmentError}
            </p>
          ) : null}
        </div>
      ) : null}

      {showEstablishmentRequired ? (
        <div className="mb-[18px]">
          <Label htmlFor="establishment" className={fieldLabelClassName}>
            {t.establishmentNameLabel}
          </Label>
          <Input
            id="establishment"
            type="text"
            name="establishment"
            value={values.establishment}
            onChange={(event) => updateField("establishment", event.target.value)}
            placeholder={t.establishmentPlaceholder}
          />
          {establishmentError ? (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {establishmentError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-6 flex items-start gap-2.5">
        <input
          id="acceptTerms"
          type="checkbox"
          name="acceptTerms"
          checked={values.acceptTerms}
          onChange={(event) => updateField("acceptTerms", event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
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
          .
        </label>
      </div>
      {acceptTermsError ? (
        <p role="alert" className="-mt-4 mb-4 text-sm text-destructive">
          {acceptTermsError}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mb-4 text-sm text-destructive" data-testid="text-register-error">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="mb-6 h-auto w-full py-3 text-sm font-bold" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : t.submit}
      </Button>
    </form>
  );
}
