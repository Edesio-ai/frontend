"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { useAuth } from "@/contexts/auth-context";
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function MotDePasseOublie() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const t = useTranslations();
  const ft = t.forgotPassword;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await resetPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes("rate limit")) {
        setErrorMessage(ft.rateLimitError);
      } else {
        setErrorMessage(ft.defaultError);
      }
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Edesio
              </span>
            </Link>
          </div>

          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-success-title">
              {ft.successTitle}
            </h1>
            <p className="text-muted-foreground mb-6">
              {ft.successMessage.replace("{email}", form.getValues("email"))}
            </p>
            <p className="text-sm text-muted-foreground mb-6">{ft.successSpamNote}</p>
            <Link href="/login">
              <Button className="w-full" data-testid="button-back-login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {ft.backToLogin}
              </Button>
            </Link>
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
          <h1 className="text-3xl font-bold mb-2" data-testid="text-forgot-password-title">
            {ft.title}
          </h1>
          <p className="text-muted-foreground">{ft.subtitle}</p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-6">
            <Mail className="h-7 w-7 text-primary" />
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ft.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={ft.emailPlaceholder}
                        {...field}
                        data-testid="input-forgot-email"
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
                data-testid="button-forgot-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {ft.submitting}
                  </>
                ) : (
                  ft.submit
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              data-testid="link-back-login"
            >
              <ArrowLeft className="h-4 w-4" />
              {ft.backToLogin}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
