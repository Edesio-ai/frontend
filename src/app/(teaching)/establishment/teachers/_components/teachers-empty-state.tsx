"use client";

import Link from "next/link";
import { GraduationCap, UserPlus } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function TeachersEmptyState() {
  const t = useTranslations().establishment.teachersPage.empty;

  return (
    <div className="flex flex-col items-center px-[24px] py-[48px] text-center">
      <div className="mb-[16px] flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-primary-muted text-primary">
        <GraduationCap className="h-[22px] w-[22px]" />
      </div>
      <p className="m-0 text-[15px] font-semibold text-foreground">{t.title}</p>
      <p className="mb-[20px] mt-[6px] max-w-[360px] text-[13.5px] leading-[1.6] text-zinc-500">{t.description}</p>
      <Link
        href="/establishment/invitations"
        className="inline-flex items-center gap-[6px] rounded-[8px] bg-primary px-[16px] py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        <UserPlus className="h-[15px] w-[15px]" />
        {t.cta}
      </Link>
    </div>
  );
}
