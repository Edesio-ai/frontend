"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Lock, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/lib/i18n/client";

const formSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();
  const t = useTranslations();
  const rpt = t.resetPassword;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleRecoverySession = async () => {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const hashType = hashParams.get("type");

      if (accessToken && hashType === "recovery") {
        localStorage.setItem("sb-127-auth-token", JSON.stringify({ access_token: accessToken }));
      }
      const session = await authService.getUserSession();
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error handling recovery session:", err);
      setIsValidSession(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRecoverySession();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authService.updatePassword(data.password);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("same as") || err.message.includes("same_password")) {
          setErrorMessage(rpt.samePasswordError);
        } else if (err.message.includes("weak")) {
          setErrorMessage(rpt.weakPasswordError);
        } else if (err.message.includes("session")) {
          setErrorMessage(rpt.sessionExpiredError);
        } else {
          setErrorMessage(rpt.defaultError);
        }
      }
      setIsSubmitting(false);
      console.error("Unexpected error:", err);
      setErrorMessage(rpt.unexpectedError);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{rpt.verifying}</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <div className="w-full max-w-md">
          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-invalid-link-title">
              {rpt.invalidLinkTitle}
            </h1>
            <p className="text-muted-foreground mb-6">
              {rpt.invalidLinkDesc}
            </p>
            <Link href="/forgotten-password">
              <Button className="w-full" data-testid="button-request-new-link">
                {rpt.requestNewLink}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
            </Link>
          </div>

          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-success-title">
              {rpt.successTitle}
            </h1>
            <p className="text-muted-foreground mb-6">
              {rpt.successMessage}
            </p>
            <Button
              className="w-full"
              onClick={() => router.push("/login")}
              data-testid="button-go-login"
            >
              {rpt.goToLogin}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-reset-password-title">
            {rpt.title}
          </h1>
          <p className="text-muted-foreground">
            {rpt.subtitle}
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-6">
            <Lock className="h-7 w-7 text-primary" />
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{rpt.password}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-new-password"
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
                    <FormLabel>{rpt.confirmPassword}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                data-testid="button-reset-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {rpt.submitting}
                  </>
                ) : (
                  rpt.submit
                )}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
