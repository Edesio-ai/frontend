"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function InvitationValidating() {
  const t = useTranslations().auth.register.new.invitation;

  return (
    <div className="flex w-full max-w-[400px] flex-col items-center justify-center py-16">
      <Loader2 className="mb-4 size-8 animate-spin text-primary" />
      <p className="text-sm text-tertiary-foreground">{t.validating}</p>
    </div>
  );
}
