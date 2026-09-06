"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/i18n/client";
import { useLogin } from "../hooks/use-login";

export default function LoginNew() {
  const { action, pending, error, emailError, passwordError } = useLogin();
  const t = useTranslations().auth.login.new;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 justify-end px-5 pt-5 sm:px-10">
        <LanguageSwitcher variant="segmented" refreshServer />
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-10 pt-6 sm:px-10 sm:pb-[60px]">
        <div className="w-full max-w-[400px]">
          <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.01em] text-foreground">{t.title}</h1>
          <p className="mb-8 text-sm text-tertiary-foreground">{t.subtitle}</p>

          <form action={action}>
            <div className="mb-[18px]">
              <Label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold">
                {t.email}
              </Label>
              <Input id="email" type="email" placeholder={t.emailPlaceholder} name="email" />
              {emailError ? (
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-semibold">
                  {t.password}
                </Label>
                <Link
                  href="/forgotten-password"
                  className="text-[12.5px] text-primary no-underline hover:text-primary/80"
                >
                  {t.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  className="pr-10"
                  name="password"
                />
                {passwordError ? (
                  <p role="alert" className="mt-1 text-sm text-destructive">
                    {passwordError}
                  </p>
                ) : null}

                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-landing-subtle"
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="mb-4 text-sm text-destructive" data-testid="text-login-error">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="mb-6 h-auto w-full py-3 text-sm font-bold">
              {pending ? <Loader2 className="size-4 animate-spin" /> : t.submit}
            </Button>
          </form>

          <p className="text-center text-[13.5px] text-tertiary-foreground">
            {t.noAccount}{" "}
            <Link href="/register" className="font-semibold text-primary no-underline hover:text-primary/80">
              {t.signup}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
