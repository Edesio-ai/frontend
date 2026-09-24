"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, Loader2, Building2, Sparkles, GraduationCap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ESTABLISHMENT_COUNTRIES,
  ESTABLISHMENT_TYPES,
  USER_ROLE,
  type EstablishmentAddress,
  type EstablishmentCountry,
  type EstablishmentType,
  UserRole,
} from "@/types";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { translateSupabaseError } from "@/lib/i18n/supabase-errors";
import { useAuth } from "@/contexts/auth-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PasswordCriteriaList } from "@/components/auth/password-criteria-list";
import { PASSWORD_COMPLEXITY_REGEX, PASSWORD_MIN_LENGTH } from "@/lib/password-criteria";
import { authService } from "@/services/auth.service";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { RequiredMark } from "../../_components/required-mark";

type EstablishmentAddressFormValues = Omit<EstablishmentAddress, "country"> & {
  country?: EstablishmentCountry;
};

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  establishmentType?: EstablishmentType;
  establishmentName?: string;
  address?: EstablishmentAddressFormValues;
  invitationToken?: string;
  acceptTerms: boolean;
};

const REGISTER_PRICING_ROLES = [USER_ROLE.selfLearner, USER_ROLE.teacher, USER_ROLE.establishment] as const;

const establishmentTypeEnum = z.enum([...ESTABLISHMENT_TYPES] as [EstablishmentType, ...EstablishmentType[]]);

const establishmentCountryEnum = z.enum([...ESTABLISHMENT_COUNTRIES] as [
  EstablishmentCountry,
  ...EstablishmentCountry[],
]);

const emptyFormValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  establishmentType: undefined,
  establishmentName: "",
  address: {
    street: "",
    zipCode: "",
    city: "",
    country: undefined,
  },
  invitationToken: "",
  acceptTerms: false,
};

function parseRegisterRoleFromQuery(role: string | null): UserRole | null {
  if (!role) return null;
  return REGISTER_PRICING_ROLES.includes(role as (typeof REGISTER_PRICING_ROLES)[number]) ? (role as UserRole) : null;
}

function buildFormSchema(
  selectedRole: UserRole,
  legacy: ReturnType<typeof useTranslations>["auth"]["register"]["legacy"],
) {
  const contact = legacy.common.contact;
  const establishment = legacy.establishment;

  const contactSchema = z.object({
    firstName: z.string().min(1, contact.firstNameRequired),
    lastName: z.string().min(1, contact.lastNameRequired),
    email: z.string().email(contact.emailInvalid),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, contact.passwordCriteria.minLength)
      .regex(PASSWORD_COMPLEXITY_REGEX, contact.passwordWeak),
    confirmPassword: z.string().min(1, contact.confirmRequired),
    invitationToken: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: legacy.common.terms.required,
    }),
  });

  const withPasswordMatch = <T extends z.ZodType<{ password: string; confirmPassword: string }>>(schema: T) =>
    schema.refine((data) => data.password === data.confirmPassword, {
      message: contact.passwordMismatch,
      path: ["confirmPassword"],
    });

  const addressSchema = z.object({
    street: z.string().trim().min(1, establishment.address.street.required),
    zipCode: z.string().trim().min(1, establishment.address.zipCode.required),
    city: z.string().trim().min(1, establishment.address.city.required),
    country: establishmentCountryEnum,
  });

  if (selectedRole === USER_ROLE.establishment) {
    return withPasswordMatch(
      contactSchema.extend({
        establishmentType: establishmentTypeEnum,
        establishmentName: z.string().trim().min(1, establishment.name.required),
        address: addressSchema,
      }),
    );
  }

  return withPasswordMatch(contactSchema);
}

type RegisterRoleFormProps = {
  selectedRole: UserRole;
  onBack: () => void;
};

function RegisterRoleForm({ selectedRole, onBack }: RegisterRoleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const legacy = t.auth.register.legacy;
  const common = legacy.common;
  const contact = common.contact;
  const establishmentLabels = legacy.establishment;

  const formSchema = useMemo(() => buildFormSchema(selectedRole, legacy), [selectedRole, legacy]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormValues,
  });

  const password = useWatch({ control: form.control, name: "password", defaultValue: "" });
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword", defaultValue: "" });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "student":
        return legacy.student.roleLabel;
      case "self-learner":
        return legacy.solo.roleLabel;
      case "teacher":
        return legacy.teacher.roleLabel;
      case "establishment":
        return legacy.establishment.roleLabel;
    }
  };

  const handleSignUp = async (data: FormValues) => {
    try {
      if (selectedRole === USER_ROLE.establishment) {
        return await authService.registerEstablishment({
          role: "establishment",
          type: data.establishmentType as EstablishmentType,
          name: data.establishmentName!.trim(),
          address: {
            street: data.address!.street.trim(),
            zipCode: data.address!.zipCode.trim(),
            city: data.address!.city.trim(),
            country: data.address!.country as EstablishmentCountry,
          },
          contact: {
            firstname: data.firstName,
            lastname: data.lastName,
            email: data.email,
            password: data.password,
            acceptTerms: data.acceptTerms,
          },
          locale,
        });
      }

      return await signUp(
        data.email,
        data.password,
        selectedRole,
        data.acceptTerms,
        data.firstName,
        data.lastName,
        undefined,
        data.invitationToken,
      );
    } catch (error) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : t.supabaseErrors.genericError;
      const translatedError = translateSupabaseError(message, t.supabaseErrors);
      setErrorMessage(`${common.errorPrefix}${translatedError}`);
      throw new Error(translatedError);
    }
  };

  const handleSignIn = async (email: string, passwordValue: string): Promise<void> => {
    try {
      await signIn(email, passwordValue);
    } catch (error) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : t.supabaseErrors.genericError;
      const translatedError = translateSupabaseError(message, t.supabaseErrors);
      setErrorMessage(`${common.signInErrorPrefix}${translatedError}`);
      throw new Error(translatedError);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const { email, password: passwordValue } = data;

    setIsSubmitting(true);
    setErrorMessage(null);

    await handleSignUp(data);
    await handleSignIn(email, passwordValue);

    if (selectedRole === "student") {
      router.push("/student");
    } else {
      const planMapping: Record<string, string> = {
        selfLearner: "self-learner",
        teacher: "teacher",
        establishment: "establishment",
      };
      router.push(`/billing/choose-plan?plan=${planMapping[selectedRole]}`);
    }
    setIsSubmitting(false);
    setErrorMessage(null);
  };

  const isEstablishment = selectedRole === USER_ROLE.establishment;

  return (
    <Card className="p-6 md:p-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="button-back-role"
      >
        <ArrowLeft className="h-4 w-4" />
        {common.changeProfile}
      </button>

      <div
        className={`flex items-center gap-3 mb-6 p-3 rounded-lg ${
          selectedRole === "self-learner"
            ? "bg-amber-500/10 border border-amber-500/20"
            : selectedRole === "teacher"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-primary/5 border border-primary/20"
        }`}
      >
        {selectedRole === "student" ? (
          <Users className="h-5 w-5 text-primary" />
        ) : selectedRole === "self-learner" ? (
          <Sparkles className="h-5 w-5 text-amber-600" />
        ) : selectedRole === "teacher" ? (
          <GraduationCap className="h-5 w-5 text-emerald-600" />
        ) : (
          <Building2 className="h-5 w-5 text-primary" />
        )}
        <span className="font-medium">{getRoleLabel(selectedRole)}</span>
      </div>

      {errorMessage && (
        <div
          className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
          data-testid="text-error-message"
        >
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isEstablishment ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">{establishmentLabels.sectionTitle}</p>

              <FormField
                control={form.control}
                name="establishmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {establishmentLabels.type.label}
                      <RequiredMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-signup-establishment-type">
                          <SelectValue placeholder={establishmentLabels.type.placeholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTABLISHMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {establishmentLabels.type.options[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="establishmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {establishmentLabels.name.label}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={establishmentLabels.name.placeholder}
                        {...field}
                        data-testid="input-signup-establishment-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {establishmentLabels.address.street.label}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <AddressAutocompleteInput
                        placeholder={establishmentLabels.address.street.placeholder}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        onAddressSelect={(selectedAddress) => {
                          form.setValue(
                            "address",
                            {
                              street: selectedAddress.street,
                              zipCode: selectedAddress.zipCode,
                              city: selectedAddress.city,
                              country: selectedAddress.country,
                            },
                            { shouldValidate: true, shouldDirty: true, shouldTouch: true },
                          );
                        }}
                        locale={locale}
                        data-testid="input-signup-establishment-street"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">{establishmentLabels.address.street.hint}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {establishmentLabels.address.zipCode.label}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={establishmentLabels.address.zipCode.placeholder}
                          {...field}
                          data-testid="input-signup-establishment-zip-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {establishmentLabels.address.city.label}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={establishmentLabels.address.city.placeholder}
                          {...field}
                          data-testid="input-signup-establishment-city"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {establishmentLabels.address.country.label}
                      <RequiredMark />
                    </FormLabel>
                    <Select key={field.value ?? "empty"} onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-signup-establishment-country">
                          <SelectValue placeholder={establishmentLabels.address.country.placeholder} />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm font-semibold text-foreground pt-2">{establishmentLabels.contactSectionTitle}</p>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {contact.firstName}
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={contact.firstNamePlaceholder} {...field} data-testid="input-signup-firstname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {contact.lastName}
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={contact.lastNamePlaceholder} {...field} data-testid="input-signup-lastname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {contact.email}
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={contact.emailPlaceholder}
                    {...field}
                    data-testid="input-signup-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {contact.password}
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...field}
                      data-testid="input-signup-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {contact.confirmPassword}
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...field}
                      data-testid="input-signup-confirm-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PasswordCriteriaList
            password={password}
            confirmPassword={confirmPassword}
            labels={contact.passwordCriteria}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="acceptTerms"
                    data-testid="checkbox-terms"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer">
                    {common.terms.accept}{" "}
                    <Link
                      href="/terms-of-service"
                      className="text-primary underline hover:no-underline"
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {common.terms.termsLink}
                    </Link>{" "}
                    {common.terms.and}{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-primary underline hover:no-underline"
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {common.terms.privacyLink}
                    </Link>
                    .<RequiredMark />
                  </label>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting} data-testid="button-signup-submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {common.submitting}
              </>
            ) : (
              common.submit
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-6">
        <p className="text-sm text-muted-foreground">
          {common.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-primary hover:underline" data-testid="link-login-bottom">
            {common.login}
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function RegisterLegacy() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [roleInitialized, setRoleInitialized] = useState(false);
  const t = useTranslations();
  const legacy = t.auth.register.legacy;
  const common = legacy.common;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleFromQuery = parseRegisterRoleFromQuery(params.get("role"));
    if (roleFromQuery) {
      setSelectedRole(roleFromQuery);
    }
    setRoleInitialized(true);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  if (!roleInitialized) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>
      <div className={`w-full ${!selectedRole ? "max-w-4xl" : "max-w-lg"}`}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Edesio
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-signup-title">
            {common.title}
          </h1>
          <p className="text-muted-foreground">{common.subtitle}</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">{common.forIndividuals}</p>
              <Card
                className={`p-6 cursor-pointer hover-elevate transition-all border-2 ${selectedRole === "self-learner" ? "border-primary" : "border-transparent"}`}
                onClick={() => handleRoleSelect("self-learner")}
                data-testid="card-role-self-learner"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{t.billing.planDetails["self-learner"].name}</h3>
                    <p className="text-sm text-muted-foreground">{legacy.solo.desc}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground mb-3">{common.forSchools}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card
                  className={`p-4 cursor-pointer hover-elevate transition-all border-2 h-full ${selectedRole === "student" ? "border-primary" : "border-transparent"}`}
                  onClick={() => handleRoleSelect("student")}
                  data-testid="card-role-student"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{legacy.student.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{legacy.student.desc}</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer hover-elevate transition-all border-2 h-full ${selectedRole === "teacher" ? "border-primary" : "border-transparent"}`}
                  onClick={() => handleRoleSelect("teacher")}
                  data-testid="card-role-teacher"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{legacy.teacher.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{legacy.teacher.desc}</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer hover-elevate transition-all border-2 h-full ${selectedRole === "establishment" ? "border-primary" : "border-transparent"}`}
                  onClick={() => handleRoleSelect("establishment")}
                  data-testid="card-role-establishment"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{legacy.establishment.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{legacy.establishment.desc}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                {common.alreadyHaveAccount}{" "}
                <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                  {common.login}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <RegisterRoleForm key={selectedRole} selectedRole={selectedRole} onBack={() => setSelectedRole(null)} />
        )}
      </div>
    </div>
  );
}
