"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "../../_components/required-mark";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { getPasswordCriteria } from "@/lib/password-criteria";
import { ESTABLISHMENT_COUNTRIES, ESTABLISHMENT_TYPES, type EstablishmentCountry } from "@/types";
import { emptyRegisterFormValues } from "../state";
import { useRegister } from "../hooks/use-register";

const fieldLabelClassName = "mb-1.5 block text-[13px] font-semibold";

const PASSWORD_CRITERIA_KEYS = ["minLength", "uppercase", "lowercase", "number", "special", "match"] as const;

type RegisterFormProps = {
  role: string;
  showEstablishmentRequired: boolean;
};

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-landing-subtle">{title}</span>
      <div className="h-px flex-1 bg-[#F0F0F2]" />
    </div>
  );
}

export default function RegisterForm({ role, showEstablishmentRequired }: RegisterFormProps) {
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
    establishmentNameError,
    establishmentTypeError,
    addressStreetError,
    addressZipCodeError,
    addressCityError,
    addressCountryError,
  } = useRegister();
  const t = useTranslations().auth.register.new;
  const establishmentLabels = useTranslations().auth.register.legacy.establishment;
  const locale = useLocale();
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

  const handleAddressSelect = (selectedAddress: {
    street: string;
    zipCode: string;
    city: string;
    country: EstablishmentCountry;
  }) => {
    setValues((current) => ({
      ...current,
      addressStreet: selectedAddress.street,
      addressZipCode: selectedAddress.zipCode,
      addressCity: selectedAddress.city,
      addressCountry: selectedAddress.country,
    }));
  };

  return (
    <form action={action}>
      <input type="hidden" name="role" value={role} />

      <div className="mb-[18px] grid grid-cols-2 gap-3.5">
        <div>
          <Label htmlFor="firstname" className={fieldLabelClassName}>
            {t.firstName}
            <RequiredMark />
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
            <RequiredMark />
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
          <RequiredMark />
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
          <RequiredMark />
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
          <RequiredMark />
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

      {showEstablishmentRequired ? (
        <>
          <SectionDivider title={t.schoolSection} />

          <div className="mb-4">
            <Label htmlFor="establishmentName" className={fieldLabelClassName}>
              {t.establishmentNameLabel}
              <RequiredMark />
            </Label>
            <Input
              id="establishmentName"
              type="text"
              name="establishmentName"
              value={values.establishmentName}
              onChange={(event) => updateField("establishmentName", event.target.value)}
              placeholder={establishmentLabels.name.placeholder}
              required
              data-testid="input-signup-establishment-name"
            />
            {establishmentNameError ? (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {establishmentNameError}
              </p>
            ) : null}
          </div>

          <div className="mb-6">
            <Label htmlFor="establishmentType" className={fieldLabelClassName}>
              {establishmentLabels.type.label}
              <RequiredMark />
            </Label>
            <input type="hidden" name="establishmentType" value={values.establishmentType} required />
            <Select
              value={values.establishmentType || undefined}
              onValueChange={(value) => updateField("establishmentType", value as typeof values.establishmentType)}
            >
              <SelectTrigger id="establishmentType" data-testid="select-signup-establishment-type">
                <SelectValue placeholder={establishmentLabels.type.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {ESTABLISHMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {establishmentLabels.type.options[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {establishmentTypeError ? (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {establishmentTypeError}
              </p>
            ) : null}
          </div>

          <SectionDivider title={t.addressSection} />

          <div className="mb-4">
            <Label htmlFor="addressStreet" className={fieldLabelClassName}>
              {establishmentLabels.address.street.label}
              <RequiredMark />
            </Label>
            <AddressAutocompleteInput
              id="addressStreet"
              name="addressStreet"
              placeholder={establishmentLabels.address.street.placeholder}
              value={values.addressStreet}
              onChange={(value) => updateField("addressStreet", value)}
              onAddressSelect={handleAddressSelect}
              locale={locale}
              required
              data-testid="input-signup-establishment-street"
            />
            <p className="mt-1 text-xs text-muted-foreground">{establishmentLabels.address.street.hint}</p>
            {addressStreetError ? (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {addressStreetError}
              </p>
            ) : null}
          </div>

          <div className="mb-4 grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
            <div>
              <Label htmlFor="addressZipCode" className={fieldLabelClassName}>
                {establishmentLabels.address.zipCode.label}
                <RequiredMark />
              </Label>
              <Input
                id="addressZipCode"
                type="text"
                name="addressZipCode"
                value={values.addressZipCode}
                onChange={(event) => updateField("addressZipCode", event.target.value)}
                placeholder={establishmentLabels.address.zipCode.placeholder}
                required
                data-testid="input-signup-establishment-zip-code"
              />
              {addressZipCodeError ? (
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {addressZipCodeError}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="addressCity" className={fieldLabelClassName}>
                {establishmentLabels.address.city.label}
                <RequiredMark />
              </Label>
              <Input
                id="addressCity"
                type="text"
                name="addressCity"
                value={values.addressCity}
                onChange={(event) => updateField("addressCity", event.target.value)}
                placeholder={establishmentLabels.address.city.placeholder}
                required
                data-testid="input-signup-establishment-city"
              />
              {addressCityError ? (
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {addressCityError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mb-[18px]">
            <Label htmlFor="addressCountry" className={fieldLabelClassName}>
              {establishmentLabels.address.country.label}
              <RequiredMark />
            </Label>
            <input type="hidden" name="addressCountry" value={values.addressCountry} required />
            <Select
              key={values.addressCountry || "empty"}
              value={values.addressCountry || undefined}
              onValueChange={(value) => updateField("addressCountry", value as typeof values.addressCountry)}
            >
              <SelectTrigger id="addressCountry" data-testid="select-signup-establishment-country">
                <SelectValue placeholder={establishmentLabels.address.country.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {[...ESTABLISHMENT_COUNTRIES]
                  .sort((a, b) =>
                    establishmentLabels.address.country.options[a].localeCompare(
                      establishmentLabels.address.country.options[b],
                    ),
                  )
                  .map((code) => (
                    <SelectItem key={code} value={code}>
                      {establishmentLabels.address.country.options[code]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {addressCountryError ? (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {addressCountryError}
              </p>
            ) : null}
          </div>
        </>
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
          .<RequiredMark />
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
