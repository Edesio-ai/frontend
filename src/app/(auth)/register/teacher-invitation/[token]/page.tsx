'use client'

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GraduationCap, Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { invitationTokenService } from "@/services/invitation-token.service";
import { useTranslations, useLocale } from "@/lib/i18n/client";
import { translateSupabaseError } from "@/lib/i18n/supabase-errors";
import { useAuth } from "@/contexts/auth-context";

interface InvitationData {
  maskedEmail: string;
  establishmentName: string;
  assignedChatbots: number;
}

export default function TeacherInvitation() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const t = useTranslations();
  const ti = t.teacherInvitation;
  const locale = useLocale();
  const [isValidating, setIsValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formSchema = useMemo(
    () =>
      z
        .object({
          firstname: z.string().min(1, ti.firstnameRequired),
          lastname: z.string().min(1, ti.lastnameRequired),
          email: z.string().email(ti.emailInvalid),
          password: z.string().min(6, ti.passwordMin),
          confirmPassword: z.string().min(1, ti.confirmRequired),
          acceptTerms: z.boolean().refine((val) => val === true, {
            message: ti.acceptRequired,
          }),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: ti.passwordMismatch,
          path: ["confirmPassword"],
        }),
    [ti]
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const validateToken = async () => {
    if (!token) {
      setValidationError(ti.invalidLink);
      setIsValidating(false);
      return;
    }

    try {
      const response = await invitationTokenService.getInvitationTokenPreview(token);

      setInvitationData({
        maskedEmail: response.maskedEmail,
        establishmentName: response.establishmentName,
        assignedChatbots: response.assignedChatbots || 0,
      });
      setIsValidating(false);
    } catch (err) {
      console.error("Token validation error:", err);
      setValidationError(ti.validationError);
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, [token]);

  const onSubmit = async (data: FormValues) => {
    if (!invitationData || !token) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signUp(
        data.email,
        data.password,
        "teacher",
        data.acceptTerms,
        data.firstname,
        data.lastname,
        invitationData.establishmentName,
        token,
      );
      const user = await signIn(data.email, data.password);
      router.push("/teacher");
    } catch (err) {
      const translatedError = translateSupabaseError(
        err instanceof Error ? err.message : ti.unknownError,
        t.supabaseErrors,
        locale,
      );
      setErrorMessage(translatedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{ti.validating}</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{ti.invalidInvitation}</h1>
          <p className="text-muted-foreground mb-6">{validationError}</p>
          <Link href="/">
            <Button data-testid="button-back-home">{ti.backHome}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-signup-title">
            {ti.createAccount}
          </h1>
          <p className="text-muted-foreground">
            {ti.invited}
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{ti.invitedBy}</p>
              <p className="font-medium">{invitationData?.establishmentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{ti.teacherAccount}</p>
              <p className="text-sm text-muted-foreground">
                {ti.forEmail} {invitationData?.maskedEmail}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">{ti.validInvitation}</span>
            </div>
          </div>

          {invitationData && invitationData.assignedChatbots > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm">
                <span className="font-medium text-amber-700">
                  {invitationData.assignedChatbots}{" "}
                  {invitationData.assignedChatbots > 1 ? ti.chatbotPlural : ti.chatbotSingular}
                </span>
                <span className="text-amber-600">{ti.chatbotsAllocated}</span>
              </p>
            </div>
          )}

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
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ti.firstname}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={ti.firstnamePlaceholder}
                          {...field}
                          data-testid="input-signup-firstname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ti.lastname}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={ti.lastnamePlaceholder}
                          {...field}
                          data-testid="input-signup-lastname"
                        />
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
                    <FormLabel>{ti.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={ti.emailPlaceholder}
                        {...field}
                        data-testid="input-signup-email"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ti.emailHint}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ti.password}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-signup-password"
                      />
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
                    <FormLabel>{ti.confirmPassword}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-signup-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm font-normal cursor-pointer"
                      >
                        {ti.acceptTerms}
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                data-testid="button-signup-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {ti.creating}
                  </>
                ) : (
                  ti.create
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">
              {ti.hasAccount}{" "}
              <Link
                href="/connexion"
                className="text-primary hover:underline"
                data-testid="link-login-bottom"
              >
                {ti.login}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
