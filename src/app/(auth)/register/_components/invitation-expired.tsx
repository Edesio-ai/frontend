"use client";

import Link from "next/link";
import { Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";

export default function InvitationExpired() {
  const t = useTranslations().auth.register.new.invitation;

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-border">
        <Link2Off className="size-[22px] text-tertiary-foreground" />
      </div>
      <h1 className="mb-2 text-[26px] font-extrabold tracking-[-0.01em] text-foreground">{t.expiredTitle}</h1>
      <p className="mb-7 text-sm leading-[1.55] text-pretty text-tertiary-foreground">{t.expiredText}</p>
      <Button
        asChild
        className="mb-6 h-auto w-full bg-foreground py-3 text-sm font-bold text-background hover:bg-foreground/90"
      >
        <Link href="/login">{t.expiredCta}</Link>
      </Button>
      <p className="text-center text-[13.5px] text-tertiary-foreground">
        {t.needHelp}{" "}
        <a href={`mailto:${t.contactEmail}`} className="font-semibold text-primary no-underline hover:text-primary/80">
          {t.contactEmail}
        </a>
      </p>
    </div>
  );
}
