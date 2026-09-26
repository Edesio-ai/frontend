"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/client";
import type { TeacherStatus } from "@/types";

const STATUS_CLASS: Record<TeacherStatus, string> = {
  active: "bg-green-50 text-green-700",
  invited: "bg-amber-50 text-amber-700",
};

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
  const t = useTranslations().establishment.teachersPage.status;

  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-[10px] py-[3px] text-[12px] font-semibold",
        STATUS_CLASS[status],
      )}
    >
      {t[status]}
    </span>
  );
}
